import { SettingsForm } from "./settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          配置 LLM API 和系统偏好
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
