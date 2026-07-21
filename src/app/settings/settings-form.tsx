"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle } from "lucide-react";

export function SettingsForm() {
  const [saved, setSaved] = useState(false);

  // 初始状态置空，避免 SSR/CSR hydration mismatch
  const [config, setConfig] = useState({ apiKey: "", baseUrl: "", model: "" });

  // 挂载后再从 localStorage 读取配置
  useEffect(() => {
    setConfig({
      apiKey: localStorage.getItem("llm_api_key") || "",
      baseUrl: localStorage.getItem("llm_base_url") || "",
      model: localStorage.getItem("llm_model") || "",
    });
  }, []);

  function handleSave() {
    // 仅保存非空值，空值表示使用服务端 .env 配置
    if (config.apiKey) {
      localStorage.setItem("llm_api_key", config.apiKey);
    } else {
      localStorage.removeItem("llm_api_key");
    }
    if (config.baseUrl) {
      localStorage.setItem("llm_base_url", config.baseUrl);
    } else {
      localStorage.removeItem("llm_base_url");
    }
    if (config.model) {
      localStorage.setItem("llm_model", config.model);
    } else {
      localStorage.removeItem("llm_model");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* LLM 配置 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">LLM API 配置</h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          配置兼容 OpenAI 格式的大模型 API。支持 OpenAI、DeepSeek、通义千问等。
          配置保存在浏览器本地，优先级高于服务端 .env 配置。留空则使用 .env 中的配置。
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) =>
                setConfig({ ...config, apiKey: e.target.value })
              }
              placeholder="sk-..."
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Base URL</label>
            <input
              value={config.baseUrl}
              onChange={(e) =>
                setConfig({ ...config, baseUrl: e.target.value })
              }
              placeholder="https://api.openai.com/v1"
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <div className="mt-2 text-xs text-[var(--muted-foreground)]">
              <p>常用地址：</p>
              <p>OpenAI: https://api.openai.com/v1</p>
              <p>DeepSeek: https://api.deepseek.com/v1</p>
              <p>通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1</p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">模型名称</label>
            <input
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-4o"
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <div className="mt-2 text-xs text-[var(--muted-foreground)]">
              <p>常用模型：gpt-4o, gpt-4o-mini, deepseek-chat, qwen-plus</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" /> 已保存
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> 保存配置
              </>
            )}
          </button>
        </div>
      </section>

      {/* 关于 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">关于</h2>
        <div className="text-sm text-[var(--muted-foreground)]">
          <p>AI 简历定制系统 v0.1.0</p>
          <p className="mt-2">
            基于 Next.js + Prisma + SQLite 构建的单用户本地应用。
            所有数据存储在本地 SQLite 数据库中，不会上传到任何服务器。
          </p>
        </div>
      </section>
    </div>
  );
}
