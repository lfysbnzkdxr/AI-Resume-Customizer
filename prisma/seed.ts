import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 技能同义词映射数据
const skillMappings = [
  // JavaScript 相关
  { canonical: "JavaScript", alias: "JS", category: "编程语言" },
  { canonical: "JavaScript", alias: "js", category: "编程语言" },
  { canonical: "TypeScript", alias: "TS", category: "编程语言" },
  { canonical: "TypeScript", alias: "ts", category: "编程语言" },

  // 前端框架
  { canonical: "React", alias: "ReactJS", category: "前端框架" },
  { canonical: "React", alias: "react.js", category: "前端框架" },
  { canonical: "Vue", alias: "VueJS", category: "前端框架" },
  { canonical: "Vue", alias: "Vue.js", category: "前端框架" },
  { canonical: "Angular", alias: "AngularJS", category: "前端框架" },
  { canonical: "Next.js", alias: "NextJS", category: "前端框架" },
  { canonical: "Next.js", alias: "Next", category: "前端框架" },

  // 后端框架
  { canonical: "Node.js", alias: "NodeJS", category: "后端框架" },
  { canonical: "Node.js", alias: "Node", category: "后端框架" },
  { canonical: "Express", alias: "ExpressJS", category: "后端框架" },
  { canonical: "Spring Boot", alias: "SpringBoot", category: "后端框架" },
  { canonical: "Django", alias: "django", category: "后端框架" },
  { canonical: "Flask", alias: "flask", category: "后端框架" },

  // 数据库
  { canonical: "MySQL", alias: "mysql", category: "数据库" },
  { canonical: "PostgreSQL", alias: "Postgres", category: "数据库" },
  { canonical: "PostgreSQL", alias: "PG", category: "数据库" },
  { canonical: "MongoDB", alias: "Mongo", category: "数据库" },
  { canonical: "Redis", alias: "redis", category: "数据库" },
  { canonical: "SQLite", alias: "sqlite", category: "数据库" },

  // 编程语言
  { canonical: "Python", alias: "py", category: "编程语言" },
  { canonical: "Java", alias: "java", category: "编程语言" },
  { canonical: "C++", alias: "CPP", category: "编程语言" },
  { canonical: "C#", alias: "CSharp", category: "编程语言" },
  { canonical: "Go", alias: "Golang", category: "编程语言" },
  { canonical: "Rust", alias: "rust", category: "编程语言" },

  // DevOps / 工具
  { canonical: "Docker", alias: "docker", category: "DevOps" },
  { canonical: "Kubernetes", alias: "K8s", category: "DevOps" },
  { canonical: "Git", alias: "git", category: "工具" },
  { canonical: "Linux", alias: "linux", category: "工具" },
  { canonical: "Nginx", alias: "nginx", category: "DevOps" },

  // AI / 机器学习
  { canonical: "PyTorch", alias: "pytorch", category: "AI框架" },
  { canonical: "TensorFlow", alias: "TF", category: "AI框架" },
  { canonical: "scikit-learn", alias: "sklearn", category: "AI框架" },

  // 其他
  { canonical: "HTML/CSS", alias: "HTML", category: "前端基础" },
  { canonical: "HTML/CSS", alias: "CSS", category: "前端基础" },
  { canonical: "Webpack", alias: "webpack", category: "构建工具" },
  { canonical: "Vite", alias: "vite", category: "构建工具" },
];

async function main() {
  console.log("开始填充种子数据...");

  // 清空现有映射
  await prisma.skillMapping.deleteMany();

  // 批量创建
  for (const mapping of skillMappings) {
    await prisma.skillMapping.create({ data: mapping });
  }

  console.log(`✅ 已创建 ${skillMappings.length} 条技能同义词映射`);
}

main()
  .catch((e) => {
    console.error("种子数据创建失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
