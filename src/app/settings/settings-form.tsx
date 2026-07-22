"use client";

import { useState, useEffect, useRef } from "react";
import { Save, CheckCircle, Download, Upload, Trash2 } from "lucide-react";
import { exportAllData, importAllData, clearAllData } from "@/lib/data-io";

export function SettingsForm() {
  const [saved, setSaved] = useState(false);
  const [dataMsg, setDataMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleExport() {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-resume-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDataMsg("导出成功");
    } catch {
      setDataMsg("导出失败");
    }
    setTimeout(() => setDataMsg(""), 3000);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importAllData(text);
      setDataMsg("导入成功，数据已恢复");
    } catch (err) {
      setDataMsg(err instanceof Error ? err.message : "导入失败，文件格式无效");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => setDataMsg(""), 3000);
  }

  async function handleClear() {
    if (!confirm("确定要清空所有数据吗？此操作不可恢复！")) return;
    if (!confirm("再次确认：所有个人信息、经历、简历、投递记录都将被永久删除。")) return;
    try {
      await clearAllData();
      setDataMsg("数据已清空");
    } catch {
      setDataMsg("清空失败");
    }
    setTimeout(() => setDataMsg(""), 3000);
  }

  return (
    <div className="space-y-6">
      {/* LLM 配置 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">LLM API 配置</h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          配置兼容 OpenAI 格式的大模型 API。支持 OpenAI、DeepSeek、通义千问等。
          配置保存在浏览器本地，API Key 仅用于直接调用 LLM 服务商，不会经过任何第三方服务器。
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

      {/* 数据管理 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">数据管理</h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          所有数据存储在浏览器 IndexedDB 中。建议定期导出备份，清除浏览器数据会导致数据丢失。
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
          >
            <Download className="h-4 w-4" /> 导出全部数据
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
          >
            <Upload className="h-4 w-4" /> 导入数据
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-md border border-[var(--destructive)] px-4 py-2 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
          >
            <Trash2 className="h-4 w-4" /> 清空所有数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        {dataMsg && (
          <p className="mt-3 text-sm text-[var(--primary)]">{dataMsg}</p>
        )}
      </section>

      {/* 关于 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">关于</h2>
        <div className="text-sm text-[var(--muted-foreground)]">
          <p>AI 简历定制系统 v0.2.0（Web 独立版）</p>
          <p className="mt-2">
            基于 Next.js + IndexedDB 构建的纯客户端应用。
            所有数据存储在浏览器本地，不会上传到任何服务器。
          </p>
        </div>
      </section>
    </div>
  );
}
