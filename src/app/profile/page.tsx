"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ProfileForm } from "./profile-form";
import { EducationSection } from "./education-section";
import { SkillSection } from "./skill-section";

export default function ProfilePage() {
  const profile = useLiveQuery(() =>
    db.profiles.toCollection().first().then((p) => p ?? null)
  );
  const educations = useLiveQuery(() => db.educations.toArray());
  const skills = useLiveQuery(() => db.skills.toArray());

  if (profile === undefined || !educations || !skills) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">个人信息</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          管理你的基本信息、教育背景和技能
        </p>
      </div>

      <ProfileForm profile={profile ?? null} />
      <EducationSection educations={educations} />
      <SkillSection skills={skills} />
    </div>
  );
}
