/**
 * 获取浏览器中保存的 LLM 配置请求头
 * 用于前端 fetch 调用时传递给后端 API
 */
export function getLLMHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("llm_api_key");
  const baseUrl = localStorage.getItem("llm_base_url");
  const model = localStorage.getItem("llm_model");

  if (apiKey) headers["x-llm-api-key"] = apiKey;
  if (baseUrl) headers["x-llm-base-url"] = baseUrl;
  if (model) headers["x-llm-model"] = model;

  return headers;
}
