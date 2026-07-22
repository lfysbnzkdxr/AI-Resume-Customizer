import type { SkillMapping } from "./db";

/**
 * 技能同义词映射种子数据
 * 仅在 IndexedDB 首次创建时通过 db.on("populate") 写入
 */
export const SEED_SKILL_MAPPINGS: SkillMapping[] = [
  // JavaScript 相关
  { id: "sm-js-1", canonical: "JavaScript", alias: "JS", category: "编程语言" },
  { id: "sm-js-2", canonical: "JavaScript", alias: "js", category: "编程语言" },
  { id: "sm-ts-1", canonical: "TypeScript", alias: "TS", category: "编程语言" },
  { id: "sm-ts-2", canonical: "TypeScript", alias: "ts", category: "编程语言" },

  // 前端框架
  { id: "sm-react-1", canonical: "React", alias: "ReactJS", category: "前端框架" },
  { id: "sm-react-2", canonical: "React", alias: "react.js", category: "前端框架" },
  { id: "sm-vue-1", canonical: "Vue", alias: "VueJS", category: "前端框架" },
  { id: "sm-vue-2", canonical: "Vue", alias: "Vue.js", category: "前端框架" },
  { id: "sm-angular-1", canonical: "Angular", alias: "AngularJS", category: "前端框架" },
  { id: "sm-next-1", canonical: "Next.js", alias: "NextJS", category: "前端框架" },
  { id: "sm-next-2", canonical: "Next.js", alias: "Next", category: "前端框架" },

  // 后端框架
  { id: "sm-node-1", canonical: "Node.js", alias: "NodeJS", category: "后端框架" },
  { id: "sm-node-2", canonical: "Node.js", alias: "Node", category: "后端框架" },
  { id: "sm-express-1", canonical: "Express", alias: "ExpressJS", category: "后端框架" },
  { id: "sm-spring-1", canonical: "Spring Boot", alias: "SpringBoot", category: "后端框架" },
  { id: "sm-django-1", canonical: "Django", alias: "django", category: "后端框架" },
  { id: "sm-flask-1", canonical: "Flask", alias: "flask", category: "后端框架" },

  // 数据库
  { id: "sm-mysql-1", canonical: "MySQL", alias: "mysql", category: "数据库" },
  { id: "sm-pg-1", canonical: "PostgreSQL", alias: "Postgres", category: "数据库" },
  { id: "sm-pg-2", canonical: "PostgreSQL", alias: "PG", category: "数据库" },
  { id: "sm-mongo-1", canonical: "MongoDB", alias: "Mongo", category: "数据库" },
  { id: "sm-redis-1", canonical: "Redis", alias: "redis", category: "数据库" },
  { id: "sm-sqlite-1", canonical: "SQLite", alias: "sqlite", category: "数据库" },

  // 编程语言
  { id: "sm-py-1", canonical: "Python", alias: "py", category: "编程语言" },
  { id: "sm-java-1", canonical: "Java", alias: "java", category: "编程语言" },
  { id: "sm-cpp-1", canonical: "C++", alias: "CPP", category: "编程语言" },
  { id: "sm-cs-1", canonical: "C#", alias: "CSharp", category: "编程语言" },
  { id: "sm-go-1", canonical: "Go", alias: "Golang", category: "编程语言" },
  { id: "sm-rust-1", canonical: "Rust", alias: "rust", category: "编程语言" },

  // DevOps / 工具
  { id: "sm-docker-1", canonical: "Docker", alias: "docker", category: "DevOps" },
  { id: "sm-k8s-1", canonical: "Kubernetes", alias: "K8s", category: "DevOps" },
  { id: "sm-git-1", canonical: "Git", alias: "git", category: "工具" },
  { id: "sm-linux-1", canonical: "Linux", alias: "linux", category: "工具" },
  { id: "sm-nginx-1", canonical: "Nginx", alias: "nginx", category: "DevOps" },

  // AI / 机器学习
  { id: "sm-pytorch-1", canonical: "PyTorch", alias: "pytorch", category: "AI框架" },
  { id: "sm-tf-1", canonical: "TensorFlow", alias: "TF", category: "AI框架" },
  { id: "sm-sklearn-1", canonical: "scikit-learn", alias: "sklearn", category: "AI框架" },

  // 其他
  { id: "sm-html-1", canonical: "HTML/CSS", alias: "HTML", category: "前端基础" },
  { id: "sm-css-1", canonical: "HTML/CSS", alias: "CSS", category: "前端基础" },
  { id: "sm-webpack-1", canonical: "Webpack", alias: "webpack", category: "构建工具" },
  { id: "sm-vite-1", canonical: "Vite", alias: "vite", category: "构建工具" },
];
