import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, extractLLMOverrides } from "@/lib/llm";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { text, url } = await request.json();

    let jdContent = text?.trim() || "";

    // 如果提供了 URL 且没有文本，尝试获取页面内容
    if (!jdContent && url?.trim()) {
      // URL 安全校验：防止 SSRF 攻击
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url.trim());
      } catch {
        return NextResponse.json(
          { error: "链接格式无效" },
          { status: 400 }
        );
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { error: "仅支持 http/https 链接" },
          { status: 400 }
        );
      }
      const blockedHosts = ["localhost", "localhost.", "127.0.0.1", "0.0.0.0", "169.254.169.254", "[::1]", "::1"];
      if (blockedHosts.includes(parsedUrl.hostname) || parsedUrl.hostname.endsWith(".localhost")) {
        return NextResponse.json(
          { error: "不允许访问内部地址" },
          { status: 400 }
        );
      }

      // 检查私有 IP 网段（RFC 1918 和其他保留地址）
      const hostname = parsedUrl.hostname;
      const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const match = hostname.match(ipv4Regex);
      if (match) {
        const [, a, b] = match.map(Number);
        const isPrivate =
          a === 10 || // 10.0.0.0/8
          (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
          (a === 192 && b === 168) || // 192.168.0.0/16
          a === 127 || // 127.0.0.0/8 (loopback)
          a === 0 || // 0.0.0.0/8
          (a === 169 && b === 254) || // 169.254.0.0/16 (link-local)
          a >= 224; // 多播和保留地址
        if (isPrivate) {
          return NextResponse.json(
            { error: "不允许访问内部地址" },
            { status: 400 }
          );
        }
      }
      // 检查 IPv6 私有地址（含 IPv4-mapped IPv6 如 ::ffff:127.0.0.1）
      if (hostname.startsWith("[") || hostname.includes(":")) {
        const ipv6 = hostname.replace(/[\[\]]/g, "").toLowerCase();
        if (
          ipv6 === "::1" ||
          ipv6.startsWith("fc") ||
          ipv6.startsWith("fd") || // fc00::/7 (unique local)
          ipv6.startsWith("fe80") || // fe80::/10 (link-local)
          ipv6.startsWith("::ffff:") // IPv4-mapped IPv6
        ) {
          return NextResponse.json(
            { error: "不允许访问内部地址" },
            { status: 400 }
          );
        }
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(parsedUrl.toString(), {
          signal: controller.signal,
          redirect: "manual", // 禁止自动跟随重定向，防止 SSRF 绕过
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        // 拒绝重定向响应
        if (res.status >= 300 && res.status < 400) {
          clearTimeout(timeout);
          return NextResponse.json(
            { error: "链接发生重定向，请直接粘贴 JD 文本" },
            { status: 400 }
          );
        }
        if (!res.ok) {
          clearTimeout(timeout);
          return NextResponse.json(
            { error: "无法获取链接内容，请直接粘贴 JD 文本" },
            { status: 400 }
          );
        }
        // 流式读取响应体，限制最大 1MB，超时覆盖整个读取过程
        const MAX_SIZE = 1024 * 1024; // 1MB
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
        // 简单提取文本内容
        jdContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 5000);
      } catch {
        return NextResponse.json(
          { error: "无法获取链接内容，请直接粘贴 JD 文本" },
          { status: 400 }
        );
      }
    }

    if (!jdContent) {
      return NextResponse.json(
        { error: "请输入 JD 文本或链接" },
        { status: 400 }
      );
    }

    // 调用 LLM 解析 JD
    const prompt = `你是一个专业的招聘 JD 分析助手。请分析以下岗位描述，提取结构化信息。

请以 JSON 格式返回，包含以下字段：
- jobTitle: 岗位名称
- company: 公司名称（如果无法确定则为 null）
- requirements: 岗位要求数组（列出所有明确的要求）
- skills: 技能要求数组（提取所有提到的技术/技能）
- keywords: 关键词数组（用于简历匹配的核心词汇）
- responsibilities: 岗位职责数组

只返回 JSON，不要其他内容。

岗位描述：
${jdContent}`;

    const result = await chatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, responseFormat: "json", overrides: extractLLMOverrides(request.headers) }
    );

    const parsed = JSON.parse(result);

    // 类型安全：确保 LLM 返回的数组字段均为字符串数组
    const toStringArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

    const skills = toStringArray(parsed.skills);
    const requirements = toStringArray(parsed.requirements);
    const keywords = toStringArray(parsed.keywords);
    const responsibilities = toStringArray(parsed.responsibilities);

    // 存入数据库
    const savedJD = await prisma.parsedJD.create({
      data: {
        source: url?.trim() ? "url" : "text",
        rawContent: jdContent,
        url: url?.trim() || null,
        jobTitle: parsed.jobTitle || null,
        company: parsed.company || null,
        requirements: JSON.stringify(requirements),
        skills: JSON.stringify(skills),
        keywords: JSON.stringify(keywords),
        responsibilities: JSON.stringify(responsibilities),
      },
    });

    return NextResponse.json({
      id: savedJD.id,
      jobTitle: parsed.jobTitle,
      company: parsed.company,
      requirements,
      skills,
      keywords,
      responsibilities,
    });
  } catch (error) {
    console.error("JD parse error:", error);
    return NextResponse.json(
      { error: "解析失败，请检查 API 配置或重试" },
      { status: 500 }
    );
  }
}
