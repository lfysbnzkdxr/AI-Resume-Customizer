# AI 简历定制系统

基于 Next.js 14 + IndexedDB 的单用户本地 AI 简历定制工具。通过 LLM 智能解析 JD、评估匹配度、基于 STAR 法则生成定制简历，帮助精准投递每一个岗位。

## 核心功能

- **JD 解析** — 支持文本粘贴和 URL 抓取两种方式，LLM 自动提取岗位要求、技能关键词、岗位职责等结构化信息
- **匹配评估** — 三维度评分（技能匹配 / 项目相关 / 经验契合）+ 差距分析 + 推荐经历排序，内置技能同义词映射提升比对准确度
- **AI 简历生成** — 基于 STAR 法则改写经历描述，自动融入 JD 关键词，支持版本管理
- **简历导出** — Markdown 下载/复制 + 浏览器打印导出 PDF
- **数据管理** — 个人信息、教育背景、技能、经历库的完整 CRUD，经历支持归档/恢复/类型筛选
- **投递追踪** — 记录每次投递状态流转（已投递 → 面试中 → 已获 Offer / 已拒绝）
- **LLM 配置** — 设置页支持浏览器端自定义 API Key / Base URL / 模型，无需修改环境变量即可切换 LLM 服务商
- **数据备份** — 支持全量数据导出/导入，防止数据丢失

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 数据库 | IndexedDB (Dexie) — 纯浏览器端存储 |
| LLM | OpenAI 兼容接口（支持 DeepSeek / 通义千问 / OpenAI 等） |
| 图标 | Lucide React |

## 快速开始

### 环境要求

- Node.js >= 18

### 安装与启动

```bash
# 克隆项目
git clone https://github.com/lfysbnzkdxr/AI-Resume-Customizer.git
cd AI-Resume-Customizer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

> **首次使用**：数据库（IndexedDB）会在首次访问时自动创建，并写入技能同义词种子数据。无需手动初始化。

### 配置 LLM

首次使用需在「设置」页面配置 LLM API：

1. 进入 **设置** 页面
2. 填写 API Key（如 DeepSeek 的 `sk-xxx`）
3. 填写 Base URL（如 `https://api.deepseek.com/v1`）
4. 填写模型名称（如 `deepseek-chat`）

支持的 LLM 服务商：

| 服务商 | Base URL | 模型示例 |
|--------|----------|----------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o`, `gpt-4o-mini` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   └── fetch-url/        # URL 抓取代理（绕过 CORS）
│   ├── experiences/          # 经历库管理
│   ├── history/              # 历史记录 & 投递追踪
│   ├── jd/
│   │   ├── parse/            # JD 解析页面
│   │   └── [id]/match/       # 匹配评估结果
│   ├── profile/              # 个人信息 / 教育 / 技能
│   ├── resume/
│   │   ├── generate/         # 简历生成
│   │   └── [id]/             # 简历预览 / 导出
│   └── settings/             # LLM 配置 & 数据管理
├── components/layout/        # 布局组件（侧边栏）
└── lib/
    ├── services/             # 业务逻辑层
    │   ├── application.ts    # 投递追踪 CRUD
    │   ├── experience.ts     # 经历 CRUD
    │   ├── jd.ts             # JD 解析 & CRUD
    │   ├── match.ts          # 匹配评估（LLM）
    │   ├── profile.ts        # 个人信息 / 教育 / 技能 CRUD
    │   ├── resume.ts         # 简历生成 & CRUD
    │   └── skill-mapping.ts  # 技能同义词归一化
    ├── client-llm.ts         # 浏览器端 LLM 调用
    ├── data-io.ts            # 数据导入/导出
    ├── db.ts                 # Dexie 数据库定义
    ├── seed-data.ts          # 技能同义词种子数据
    └── utils.ts              # 工具函数
```

## 使用说明

1. **填写个人信息** — 首次使用先进入「个人信息」页填写基本资料、教育背景和技能
2. **积累经历库** — 在「经历库」中添加项目、实习、竞赛等经历描述
3. **解析 JD** — 在「JD 解析」页粘贴招聘文本或输入职位链接
4. **查看匹配度** — 解析完成后点击「匹配评估」查看三维度评分和差距分析
5. **生成简历** — 选择目标 JD 和推荐经历，一键生成 STAR 法则定制简历
6. **导出投递** — 预览简历后导出 PDF/Markdown，在「历史记录」中跟踪投递状态

## 数据存储说明

所有数据存储在浏览器 IndexedDB 中，**不会上传到任何服务器**：

- 个人信息、经历、简历等数据仅存于本地浏览器
- LLM API Key 仅存于浏览器 localStorage，直接发送给 LLM 服务商
- 建议定期在「设置」页导出备份，清除浏览器数据会导致数据丢失

## License

MIT
