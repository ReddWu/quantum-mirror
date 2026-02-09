# Quantum Mirror - 部署指南

本指南将帮助你将 Quantum Mirror 应用部署到 Vercel 或其他平台。

## 目录
- [准备工作](#准备工作)
- [环境变量配置](#环境变量配置)
- [数据库设置](#数据库设置)
- [Vercel 部署](#vercel-部署)
- [其他部署选项](#其他部署选项)
- [故障排除](#故障排除)

## 准备工作

### 1. 获取 Gemini API 密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的 Google 账号
3. 点击 "Get API Key" 创建新的 API 密钥
4. 复制并保存这个密钥

### 2. 设置数据库

你可以选择以下数据库之一：

#### 选项 A: Vercel Postgres（推荐用于 Vercel 部署）
1. 在 Vercel 项目中添加 Postgres 数据库
2. Vercel 会自动设置 `DATABASE_URL` 环境变量

#### 选项 B: PlanetScale（MySQL）
1. 注册 [PlanetScale](https://planetscale.com/)
2. 创建新数据库
3. 获取连接字符串

#### 选项 C: Supabase（PostgreSQL）
1. 注册 [Supabase](https://supabase.com/)
2. 创建新项目
3. 在 Settings > Database 中获取连接字符串

#### 选项 D: 本地开发（SQLite）
- 无需额外设置，项目已配置为使用 SQLite（`dev.db`）

### 3. 配置认证提供者（可选但推荐）

#### Google OAuth
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 "Google+ API"
4. 创建 OAuth 2.0 凭证：
   - 应用类型：Web 应用
   - 授权的重定向 URI：`https://your-domain.com/api/auth/callback/google`
5. 复制 Client ID 和 Client Secret

#### Email 认证
1. 配置 SMTP 服务器（推荐使用 SendGrid、Resend 或 Mailgun）
2. 获取 SMTP 连接字符串

### 4. Cloudinary 配置（可选，用于图片存储）

1. 注册 [Cloudinary](https://cloudinary.com/)
2. 在 Dashboard 中获取：
   - Cloud Name
   - API Key
   - API Secret

## 环境变量配置

创建 `.env` 文件（本地开发）或在部署平台设置以下环境变量：

```bash
# Gemini API（必需）
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_TEXT=gemini-1.5-flash
GEMINI_MODEL_MULTI=gemini-1.5-flash

# 数据库（必需）
# 选择以下之一：
# SQLite（本地开发）
DATABASE_URL=file:./dev.db

# PostgreSQL
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# MySQL/PlanetScale
# DATABASE_URL=mysql://user:password@host:3306/dbname

# NextAuth（必需）
AUTH_SECRET=your_random_secret_here
# 生成方法: openssl rand -base64 32

# Google OAuth（可选）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email 认证（可选）
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@yourdomain.com

# Cloudinary（可选）
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 生成 AUTH_SECRET

```bash
openssl rand -base64 32
```

或使用在线工具：https://generate-secret.vercel.app/32

## 数据库设置

### 1. 更新 Prisma Schema

如果使用非 SQLite 数据库，需要更新 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

### 2. 生成 Prisma Client 并推送 Schema

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 推送数据库 schema
npx prisma db push

# 或使用 migrations（生产环境推荐）
npx prisma migrate deploy
```

## Vercel 部署

### 方法 1: 通过 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 Git 仓库（GitHub、GitLab 或 Bitbucket）
4. 配置项目：
   - Framework Preset: Next.js
   - Root Directory: `./` （如果项目在根目录）
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. 添加环境变量（参考上面的环境变量配置）
6. 点击 "Deploy"

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 配置 Vercel Postgres（推荐）

1. 在 Vercel 项目中，进入 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 创建数据库后，Vercel 会自动添加 `DATABASE_URL` 环境变量
5. 更新 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

6. 在 Vercel 项目设置中添加构建命令：

```bash
# 在 package.json 的 scripts 中添加
"postinstall": "prisma generate",
"vercel-build": "prisma db push && next build"
```

## 其他部署选项

### Railway

1. 访问 [Railway](https://railway.app/)
2. 连接 GitHub 仓库
3. 添加 Postgres 插件
4. 配置环境变量
5. Railway 会自动检测并部署 Next.js 应用

### Netlify

1. 访问 [Netlify](https://www.netlify.com/)
2. 导入 Git 仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 添加环境变量
5. 部署

注意：Netlify 需要额外配置来支持 Next.js API 路由。

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

构建并运行：

```bash
docker build -t quantum-mirror .
docker run -p 3000:3000 --env-file .env quantum-mirror
```

## 部署后检查清单

- [ ] 所有环境变量已正确配置
- [ ] 数据库连接正常
- [ ] Prisma schema 已推送到数据库
- [ ] Google OAuth 重定向 URI 已添加
- [ ] Gemini API 密钥有效且有配额
- [ ] 应用可以正常访问
- [ ] 用户可以注册/登录
- [ ] 所有主要功能正常工作：
  - [ ] 创建目标
  - [ ] 未来自我对话
  - [ ] 现实重构（图片上传）
  - [ ] 行动生成和打卡
  - [ ] 历史记录显示

## 故障排除

### 问题 1: 数据库连接失败

**解决方案：**
- 检查 `DATABASE_URL` 格式是否正确
- 确认数据库服务正在运行
- 检查防火墙设置是否允许连接
- 对于 Vercel Postgres，确保已在项目中添加数据库

### 问题 2: Prisma Client 未生成

**解决方案：**
```bash
npx prisma generate
```

或在 `package.json` 中添加：
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 问题 3: NextAuth 会话错误

**解决方案：**
- 确保 `AUTH_SECRET` 已设置
- 检查数据库表是否正确创建
- 验证 OAuth 回调 URL 配置正确

### 问题 4: Gemini API 调用失败

**解决方案：**
- 确认 API 密钥有效
- 检查是否有 API 配额
- 确认模型名称正确（`gemini-1.5-flash` 或 `gemini-1.5-pro`）
- 查看错误日志了解详细信息

### 问题 5: 图片上传失败

**解决方案：**
- 如果使用 Cloudinary，确认所有凭证正确
- 如果不使用 Cloudinary，确保前端传入的是有效的图片 URL
- 检查图片 URL 是否可公开访问

### 问题 6: 构建失败

**解决方案：**
```bash
# 清除缓存
rm -rf .next node_modules
npm install
npm run build
```

## 性能优化建议

1. **启用数据库连接池**
   - 在 `DATABASE_URL` 中添加 `?connection_limit=5`

2. **配置 CDN**
   - 使用 Vercel 自带的 CDN
   - 或配置 Cloudflare

3. **图片优化**
   - 使用 Cloudinary 的自动优化功能
   - 或使用 Next.js 的 Image 组件

4. **API 速率限制**
   - 实施 API 速率限制保护 Gemini API 配额
   - 考虑使用缓存减少 API 调用

## 监控和日志

### Vercel Analytics
在 Vercel Dashboard 中启用 Analytics 来监控：
- 页面访问量
- 性能指标
- 错误率

### 错误追踪
推荐集成以下服务之一：
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)
- [Datadog](https://www.datadoghq.com/)

## 安全建议

1. **环境变量**
   - 永远不要在代码中硬编码敏感信息
   - 使用平台的环境变量管理功能

2. **API 密钥保护**
   - 定期轮换 API 密钥
   - 监控 API 使用情况

3. **数据库安全**
   - 使用强密码
   - 启用 SSL 连接
   - 定期备份

4. **CORS 配置**
   - 仅允许来自你的域名的请求

5. **速率限制**
   - 实施 API 速率限制
   - 防止滥用

## 更新和维护

### 更新依赖
```bash
# 检查过期的包
npm outdated

# 更新依赖
npm update

# 或使用 npm-check-updates
npx npm-check-updates -u
npm install
```

### 数据库迁移
```bash
# 创建新迁移
npx prisma migrate dev --name your_migration_name

# 应用迁移到生产环境
npx prisma migrate deploy
```

## 支持和资源

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [NextAuth.js 文档](https://next-auth.js.org/)
- [Gemini API 文档](https://ai.google.dev/docs)
- [Vercel 文档](https://vercel.com/docs)

## 贡献和反馈

如果你在部署过程中遇到问题或有改进建议，欢迎提交 Issue 或 Pull Request。

---

祝你部署顺利！🚀
