# AI 简历定制系统

基于 Next.js 14 + Prisma + SQLite 的单用户本地 AI 简历定制工具。通过 LLM 智能解析 JD、评估匹配度、基于 STAR 法则生成定制简历，帮助精准投递每一个岗位。

## 核心功能

- **JD 解析** — 支持文本粘贴和 URL 抓取两种方式，LLM 自动提取岗位要求、技能关键词、岗位职责等结构化信息
- **匹配评估** — 三维度评分（技能匹配 / 项目相关 / 经验契合）+ 差距分析 + 推荐经历排序，内置技能同义词映射提升比对准确度
- **AI 简历生成** — 基于 STAR 法则改写经历描述，自动融入 JD 关键词，支持版本管理
- **简历导出** — Markdown 下载/复制 + 浏览器打印导出 PDF
- **数据管理** — 个人信息、教育背景、技能、经历库的完整 CRUD，经历支持归档/恢复/类型筛选
- **投递追踪** — 记录每次投递状态流转（已投递 → 面试中 → 已获 Offer / 已拒绝）
- **LLM 配置覆盖** — 设置页支持浏览器端自定义 API Key / Base URL / 模型，无需修改环境变量即可切换 LLM 服务商

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 数据库 | SQLite + Prisma ORM |
| LLM | OpenAI 兼容接口（支持 DeepSeek / 通义千问 / OpenAI 等） |
| 图标 | Lucide React |

## 快速开始

### 环境要求

- Node.js >= 18

### 安装与配置

```bash
# 克隆项目
git clone https://github.com/lfysbnzkdxr/AI-Resume-Customizer.git
cd AI-Resume-Customizer

# 安装依赖（自动执行 prisma generate）
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 LLM API Key 和服务地址
```

`.env` 配置说明：

```env
# LLM 配置（兼容 OpenAI 格式的任意服务）
# OpenAI:    https://api.openai.com/v1
# DeepSeek:  https://api.deepseek.com/v1
# 通义千问:  https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=sk-xxx
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# 数据库（默认即可，无需修改）
DATABASE_URL=file:./data.db
```

### 初始化数据库

```bash
# 创建表结构
npm run db:push

# （可选）填充技能同义词种子数据
npm run db:seed
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |
| `npm run db:push` | 同步数据库表结构 |
| `npm run db:seed` | 填充种子数据 |
| `npm run db:generate` | 重新生成 Prisma Client |

## 项目结构

```
src/
├── app/
│   ├── api/                  # API 路由
│   │   ├── jd/parse/         # JD 解析（文本/URL）
│   │   ├── jd/[id]/match/    # JD-经历匹配评估
│   │   └── resume/generate/  # AI 简历生成
│   ├── experiences/          # 经历库管理
│   ├── history/              # 历史记录 & 投递追踪
│   ├── jd/                   # JD 解析页面 & 匹配结果
│   ├── profile/              # 个人信息 / 教育 / 技能
│   ├── resume/               # 简历管理 / 生成 / 预览
│   └── settings/             # LLM 配置覆盖
├── components/layout/        # 布局组件（侧边栏）
└── lib/                      # 工具库（Prisma / LLM / 通用）
prisma/
├── schema.prisma             # 数据模型定义
└── seed.ts                   # 技能同义词种子数据
```

## 使用说明

1. **填写个人信息** — 首次使用先进入「个人信息」页填写基本资料、教育背景和技能
2. **积累经历库** — 在「经历库」中添加项目、实习、竞赛等经历描述
3. **解析 JD** — 在「JD 解析」页粘贴招聘文本或输入职位链接
4. **查看匹配度** — 解析完成后点击「匹配评估」查看三维度评分和差距分析
5. **生成简历** — 选择目标 JD 和推荐经历，一键生成 STAR 法则定制简历
6. **导出投递** — 预览简历后导出 PDF/Markdown，在「历史记录」中跟踪投递状态

## License

MIT
