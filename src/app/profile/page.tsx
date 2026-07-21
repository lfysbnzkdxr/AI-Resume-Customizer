import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { EducationSection } from "./education-section";
import { SkillSection } from "./skill-section";

export default async function ProfilePage() {
  const profile = await prisma.profile.findFirst();
  const educations = await prisma.education.findMany();
  const skills = await prisma.skill.findMany();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">个人信息</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          管理你的基本信息、教育背景和技能
        </p>
      </div>

      <ProfileForm profile={profile} />
      <EducationSection educations={educations} />
      <SkillSection skills={skills} />
    </div>
  );
}
