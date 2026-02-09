# Quantum Mirror

<div align="center">
  <h3>与未来自我对话，重构现实，坍缩行动</h3>
  <p>由 Gemini AI 驱动的目标实现和行动打卡应用</p>
</div>

## 功能特性

- **未来自我对话**：与已实现目标的未来自己对话，获得温和的挑战与叙事重写
- **现实重构**：上传现实场景照片，AI 识别 3 个具体的未来差异点
- **行动坍缩**：生成 10-20 分钟的可完成物理行动，拍照打卡后获得 AI 反馈
- **连续打卡**：记录你的行动历史，保持连续打卡 streak
- **安全保护**：自伤关键词检测，自动显示安全提示和求助资源

## 技术栈

- **框架**：Next.js 16 (App Router) + TypeScript
- **样式**：Tailwind CSS 4
- **认证**：NextAuth.js (支持 Google OAuth 和 Email)
- **数据库**：Prisma ORM (支持 PostgreSQL、MySQL、SQLite)
- **AI**：Google Gemini 1.5 (`@google/generative-ai`)
- **图片存储**：Cloudinary（可选）
- **状态管理**：Zustand

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd quantum-mirror
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 示例文件并填入你的配置：

```bash
# Gemini API（必需）
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_TEXT=gemini-1.5-flash
GEMINI_MODEL_MULTI=gemini-1.5-flash

# 数据库（必需）
DATABASE_URL=file:./dev.db  # 本地开发使用 SQLite

# NextAuth（必需）
AUTH_SECRET=your_random_secret_here  # 使用: openssl rand -base64 32

# Google OAuth（可选）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email 认证（可选）
EMAIL_SERVER=
EMAIL_FROM=

# Cloudinary（可选）
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 推送数据库 schema
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
quantum-mirror/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # NextAuth 认证
│   │   │   ├── goals/         # 目标管理
│   │   │   ├── mirror/        # 核心功能 API
│   │   │   └── session/       # 会话管理
│   │   ├── goals/             # 目标页面
│   │   ├── history/           # 历史记录页面
│   │   ├── session/           # 会话相关页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── providers.tsx      # 上下文提供者
│   ├── components/            # React 组件
│   │   ├── mirror/           # 核心功能组件
│   │   ├── ui/               # UI 组件
│   │   └── navigation.tsx    # 导航栏
│   ├── lib/                   # 工具函数和配置
│   │   ├── auth.ts           # NextAuth 配置
│   │   ├── gemini.ts         # Gemini API 集成
│   │   ├── prisma.ts         # Prisma 客户端
│   │   ├── safety.ts         # 安全检测
│   │   ├── streak.ts         # 打卡计算
│   │   ├── cloudinary.ts     # 图片上传
│   │   └── validators.ts     # 数据验证
│   ├── stores/                # Zustand 状态管理
│   └── types/                 # TypeScript 类型定义
├── prisma/
│   └── schema.prisma          # 数据库 schema
├── public/                    # 静态资源
├── DEPLOYMENT.md              # 详细部署指南
└── README.md                  # 本文件
```

## API 路由

### 认证
- `GET/POST /api/auth/[...nextauth]` - NextAuth 认证处理

### 目标管理
- `GET /api/goals` - 获取用户的所有目标
- `POST /api/goals` - 创建新目标

### 会话管理
- `GET /api/session/today` - 获取今日会话
- `POST /api/session/today` - 创建今日会话

### 核心功能
- `POST /api/mirror/chat` - 未来自我对话
- `POST /api/mirror/reframe` - 现实重构（图片分析）
- `POST /api/mirror/action/generate` - 生成行动任务
- `POST /api/mirror/action/checkin` - 行动打卡

## 前端路由

- `/` - 首页（未登录：产品介绍；已登录：仪表板）
- `/goals` - 目标创建和管理
- `/session/today` - 今日会话（未来自我对话）
- `/session/today/reframe` - 现实重构（图片上传和分析）
- `/session/today/action` - 行动生成和打卡
- `/history` - 历史记录和连续打卡统计

## 核心功能说明

### 1. 未来自我对话

用户与已实现目标的未来自己进行对话，AI 会：
- 提供温和、具体的回复
- 给出友善的挑战性问题
- 重写用户的叙事框架
- 建议下一步行动（如：是否进入现实重构或行动生成）

### 2. 现实重构

用户上传当前环境的照片，AI 通过多模态分析：
- 识别 3 个具体的未来差异点（物件、布局、行为痕迹等）
- 提供 80-150 字的旁白描述
- 为后续行动生成提供线索

### 3. 行动坍缩

基于对话和重构结果，AI 生成：
- 10-20 分钟可完成的物理行动
- 具体的步骤指导
- 行动的理由说明
- 需要拍照证明完成

### 4. 行动打卡

用户完成行动后上传照片，AI 提供：
- 确认和反馈
- 一个可持续的微调建议
- 明日行动提示

### 5. 安全保护

系统会检测用户输入中的自伤关键词，如果检测到会：
- 立即返回安全提示
- 显示求助热线信息
- 强调工具的性质（非医疗服务）

## 部署

详细的部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 快速部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

## 开发

### 构建项目

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

### 代码检查

```bash
npm run lint
```

### 数据库管理

```bash
# 打开 Prisma Studio（可视化数据库管理）
npx prisma studio

# 创建数据库迁移
npx prisma migrate dev --name your_migration_name

# 重置数据库
npx prisma migrate reset
```

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `GEMINI_API_KEY` | 是 | Google Gemini API 密钥 |
| `GEMINI_MODEL_TEXT` | 否 | 文本模型名称（默认：gemini-1.5-flash） |
| `GEMINI_MODEL_MULTI` | 否 | 多模态模型名称（默认：gemini-1.5-flash） |
| `DATABASE_URL` | 是 | 数据库连接字符串 |
| `AUTH_SECRET` | 是 | NextAuth 加密密钥 |
| `GOOGLE_CLIENT_ID` | 否 | Google OAuth 客户端 ID |
| `GOOGLE_CLIENT_SECRET` | 否 | Google OAuth 客户端密钥 |
| `EMAIL_SERVER` | 否 | SMTP 服务器配置 |
| `EMAIL_FROM` | 否 | 发件人邮箱地址 |
| `CLOUDINARY_CLOUD_NAME` | 否 | Cloudinary 云名称 |
| `CLOUDINARY_API_KEY` | 否 | Cloudinary API 密钥 |
| `CLOUDINARY_API_SECRET` | 否 | Cloudinary API 密钥 |

## 安全注意事项

1. **本应用不是医疗或心理治疗服务**
   - 仅作为自我反思和行动规划工具使用
   - 不应替代专业的心理健康服务

2. **数据隐私**
   - 所有用户数据存储在你自己的数据库中
   - Gemini API 调用遵循 Google 的隐私政策

3. **API 密钥保护**
   - 永远不要在代码中硬编码 API 密钥
   - 使用环境变量管理敏感信息
   - 定期轮换 API 密钥

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 支持

如有问题或建议，请：
- 提交 GitHub Issue
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细帮助

---

**注意**：Quantum Mirror 是一个自我反思和行动规划工具，不是医疗或心理治疗服务。如果你有自我伤害想法或严重的心理健康问题，请立即联系专业医疗机构或紧急求助热线。
