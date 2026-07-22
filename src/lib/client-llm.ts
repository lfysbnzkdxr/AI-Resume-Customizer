/**
 * 浏览器端 LLM 直连模块
 * 使用原生 fetch 调用 OpenAI 兼容 API，无需 openai SDK
 * 用户的 API Key 仅存储在浏览器 localStorage 中，直接发给 LLM 服务商
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  responseFormat?: "json" | "text";
}

export function getLLMConfig() {
  return {
    apiKey: localStorage.getItem("llm_api_key") || "",
    baseURL: localStorage.getItem("llm_base_url") || "https://api.deepseek.com/v1",
    model: localStorage.getItem("llm_model") || "deepseek-chat",
  };
}

/** 检查是否已配置 API Key */
export function isLLMConfigured(): boolean {
  return !!localStorage.getItem("llm_api_key");
}

/**
 * 调用 LLM Chat Completion API
 * @throws Error 如果未配置 API Key 或调用失败
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<string> {
  const { apiKey, baseURL, model } = getLLMConfig();

  if (!apiKey) {
    throw new Error("请先在设置页配置 API Key");
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
  };

  if (options?.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `LLM 调用失败 (${res.status}): ${errText || res.statusText}`
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * 调用 LLM 并解析 JSON 响应
 * @throws Error 如果响应不是有效 JSON
 */
export async function chatCompletionJSON<T = unknown>(
  messages: ChatMessage[],
  options?: Omit<ChatOptions, "responseFormat">
): Promise<T> {
  const result = await chatCompletion(messages, {
    ...options,
    responseFormat: "json",
  });

  try {
    return JSON.parse(result) as T;
  } catch {
    // 尝试提取 JSON 块（LLM 有时会包裹 ```json ... ```）
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        // 代码块内容仍非有效 JSON，继续抛出友好错误
      }
    }
    throw new Error("LLM 返回的内容不是有效 JSON");
  }
}
