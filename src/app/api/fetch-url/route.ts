import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";
import net from "net";

/**
 * URL 抓取代理（Serverless Function）
 * 浏览器受 CORS 限制无法直接抓取任意网页，此路由仅做 URL -> 纯文本提取
 * 不涉及 LLM、不涉及数据库
 */

/** 判断 IPv4 地址是否为私有/保留地址 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return true;
  const [a, b] = parts;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    a >= 224 // 组播 + 保留
  );
}

/** 判断 IPv6 地址是否为私有/保留地址 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:") || // IPv4-mapped IPv6
    normalized === "0:0:0:0:0:0:0:1" ||
    normalized === "0:0:0:0:0:0:0:0"
  );
}

/** 判断任意 IP 是否为私有地址 */
function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true; // 无法识别的地址视为不安全
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "请提供有效的 URL" }, { status: 400 });
    }

    // URL 安全校验：防止 SSRF 攻击
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "链接格式无效" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "仅支持 http/https 链接" }, { status: 400 });
    }

    // 阻止内部地址（字面量快速拦截）
    const blockedHosts = ["localhost", "localhost.", "127.0.0.1", "0.0.0.0", "169.254.169.254", "[::1]", "::1"];
    if (blockedHosts.includes(parsedUrl.hostname) || parsedUrl.hostname.endsWith(".localhost")) {
      return NextResponse.json({ error: "不允许访问内部地址" }, { status: 400 });
    }

    // 检查字面 IP 地址（支持 IPv4/IPv6）
    const hostname = parsedUrl.hostname.replace(/^\[|\]$/g, ""); // 去除 IPv6 方括号
    let safeIP: string | null = null;

    if (net.isIP(hostname)) {
      if (isPrivateIP(hostname)) {
        return NextResponse.json({ error: "不允许访问内部地址" }, { status: 400 });
      }
      safeIP = hostname;
    } else {
      // 域名：DNS 解析并校验所有 IP（同时查询 A 和 AAAA 记录，防止 IPv6-only 域名被误拒）
      let allIPs: string[] = [];
      try {
        allIPs.push(...(await dns.resolve(hostname)));
      } catch { /* 无 A 记录 */ }
      try {
        allIPs.push(...(await dns.resolve6(hostname)));
      } catch { /* 无 AAAA 记录 */ }

      if (allIPs.length === 0) {
        return NextResponse.json({ error: "无法解析域名" }, { status: 400 });
      }
      for (const ip of allIPs) {
        if (isPrivateIP(ip)) {
          return NextResponse.json({ error: "不允许访问内部地址" }, { status: 400 });
        }
      }
      // 选取第一个通过校验的公网 IP，用于固定连接（防止 DNS Rebinding）
      safeIP = allIPs[0];
    }

    // 抓取页面内容（使用已校验的 IP 直连，防止 DNS Rebinding TOCTOU 攻击）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    // 将 URL 中的域名替换为已校验的 IP，并设置 Host 头保证虚拟主机路由正确
    const fetchUrl = new URL(parsedUrl.toString());
    const isIPv6 = net.isIPv6(safeIP);
    fetchUrl.hostname = isIPv6 ? `[${safeIP}]` : safeIP;

    const res = await fetch(fetchUrl.toString(), {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Host: parsedUrl.hostname,
      },
    });

    if (res.status >= 300 && res.status < 400) {
      clearTimeout(timeout);
      return NextResponse.json({ error: "链接发生重定向，请直接粘贴 JD 文本" }, { status: 400 });
    }

    if (!res.ok) {
      clearTimeout(timeout);
      return NextResponse.json({ error: "无法获取链接内容，请直接粘贴 JD 文本" }, { status: 400 });
    }

    // 流式读取，限制最大 1MB
    const MAX_SIZE = 1024 * 1024;
    const reader = res.body?.getReader();
    let html = "";

    if (reader) {
      const decoder = new TextDecoder();
      let totalSize = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalSize += value.byteLength;
        if (totalSize > MAX_SIZE) {
          controller.abort();
          break;
        }
        html += decoder.decode(value, { stream: true });
      }
    } else {
      html = await res.text();
    }
    clearTimeout(timeout);

    // 提取纯文本
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "无法获取链接内容，请直接粘贴 JD 文本" }, { status: 500 });
  }
}
