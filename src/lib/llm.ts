import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

function createOpenAIClient(apiKey?: string, baseURL?: string) {
  return new OpenAI({
    apiKey: apiKey || process.env.LLM_API_KEY,
    baseURL: baseURL || process.env.LLM_BASE_URL || "https://api.openai.com/v1",
  });
}

export const openai = globalForOpenAI.openai ?? createOpenAIClient();

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

export const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o";

/** LLM 配置覆盖项（由请求头传入） */
export interface LLMOverrides {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

/**
 * 从请求头中提取 LLM 配置覆盖项
 */
export function extractLLMOverrides(headers: Headers): LLMOverrides {
  return {
    apiKey: headers.get("x-llm-api-key") || undefined,
    baseURL: headers.get("x-llm-base-url") || undefined,
    model: headers.get("x-llm-model") || undefined,
  };
}

/**
 * 校验覆盖的 baseURL 是否安全（禁止内网地址）
 */
function isSafeBaseURL(baseURL: string): boolean {
  try {
    const parsed = new URL(baseURL);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname.toLowerCase();
    const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "[::1]", "::1"];
    if (blocked.includes(hostname) || hostname.endsWith(".localhost")) return false;
    // 禁止私有 IP 段
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const a = Number(ipv4Match[1]);
      const b = Number(ipv4Match[2]);
      if (a === 10 || a === 127 || a === 0 || a >= 224 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)) return false;
    }
    // 禁止 IPv6 私有地址（含 IPv4-mapped）
    if (hostname.includes(":")) {
      const ipv6 = hostname.replace(/[\[\]]/g, "");
      if (ipv6 === "::1" || ipv6.startsWith("fc") || ipv6.startsWith("fd") || ipv6.startsWith("fe80") || ipv6.startsWith("::ffff:")) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 通用 LLM 调用封装，支持配置覆盖
 * 安全策略：apiKey 和 baseURL 必须同时提供才启用覆盖，防止服务端密钥泄漏到任意 endpoint
 */
export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "json" | "text";
    overrides?: LLMOverrides;
  }
) {
  // 仅当 apiKey 和 baseURL 同时提供时才使用覆盖配置，避免服务端密钥被发送到客户端指定的任意地址
  const hasFullOverride = Boolean(options?.overrides?.apiKey && options?.overrides?.baseURL);
  const client =
    hasFullOverride && isSafeBaseURL(options!.overrides!.baseURL!)
      ? createOpenAIClient(options!.overrides!.apiKey, options!.overrides!.baseURL)
      : openai;

  const model = options?.overrides?.model || LLM_MODEL;

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    ...(options?.responseFormat === "json"
      ? { response_format: { type: "json_object" } }
      : {}),
  });

  return response.choices[0]?.message?.content ?? "";
}
