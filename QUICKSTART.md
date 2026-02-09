# Quantum Mirror - 快速入门指南

这是一个 5 分钟快速启动指南，帮助你快速运行 Quantum Mirror 应用。

## 前置要求

- Node.js 20 或更高版本
- npm 或 yarn
- Google Gemini API 密钥（免费）

## 第一步：获取 Gemini API 密钥

1. 访问 https://makersuite.google.com/app/apikey
2. 使用 Google 账号登录
3. 点击 "Get API Key" 或 "Create API Key"
4. 复制生成的 API 密钥

## 第二步：安装和配置

```bash
# 克隆或进入项目目录
cd quantum-mirror

# 安装依赖
npm install

# 配置环境变量
# 编辑 .env 文件，至少设置以下内容：
```

在 `.env` 文件中添加：

```bash
GEMINI_API_KEY=你的_API_密钥
DATABASE_URL=file:./dev.db
AUTH_SECRET=请运行_openssl_rand_-base64_32_生成
```

生成 AUTH_SECRET：

```bash
# macOS/Linux
openssl rand -base64 32

# 复制输出的字符串到 .env 文件的 AUTH_SECRET
```

## 第三步：初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma db push
```

## 第四步：启动应用

```bash
npm run dev
```

访问 http://localhost:3000 即可开始使用！

## 使用流程

### 1. 首次访问

当你第一次访问应用时：
- 如果没有配置 OAuth，你需要手动创建用户（或配置 Email 认证）
- 暂时可以通过修改代码跳过认证（仅用于开发测试）

### 2. 创建目标

1. 登录后，点击"创建目标"或访问 `/goals`
2. 输入你的目标标题，例如："每天早起运动"
3. 可选：添加目标描述
4. 点击"创建"

### 3. 开始对话

1. 在首页选择你的目标
2. 点击"开始对话"进入 `/session/today`
3. 输入你今天的想法、担忧或状态
4. AI 会以未来自我的角度回复你

### 4. 现实重构（可选）

1. 在会话页面点击"Reframe"标签
2. 上传当前环境的照片（需要有效的图片 URL）
3. AI 会分析照片并识别 3 个未来差异点

### 5. 生成行动

1. 点击"Action"标签
2. 粘贴对话或重构中的关键洞察
3. 点击"Collapse into action"生成今日行动任务
4. AI 会生成 10-20 分钟的可完成行动

### 6. 打卡完成

1. 完成行动后，上传证明照片（URL）
2. 可选：写下你的感受
3. 点击"I did it"提交
4. 获得 AI 反馈和明日建议

### 7. 查看历史

访问 `/history` 查看：
- 所有历史会话
- 连续打卡天数（Streak）
- 完成的行动任务

## 开发测试技巧

### 跳过认证（仅用于开发）

临时修改 API 路由以跳过认证检查：

```typescript
// 在任何 API 路由中
export async function POST(req: Request) {
  // 注释掉认证检查
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // 使用测试用户 ID
  const userId = "test-user-id";

  // ... 继续处理
}
```

### 使用 Prisma Studio

查看和管理数据库内容：

```bash
npx prisma studio
```

这会打开一个 Web 界面（通常在 http://localhost:5555），你可以：
- 查看所有表和数据
- 手动添加、编辑、删除记录
- 调试数据问题

### 测试 Gemini API

创建一个简单的测试脚本：

```typescript
// test-gemini.ts
import { generateFutureSelfChat } from './src/lib/gemini';

async function test() {
  try {
    const result = await generateFutureSelfChat("我今天很累，不想运动");
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

运行：

```bash
npx tsx test-gemini.ts
```

## 常见问题

### Q: 无法连接数据库

**A:** 确保 `DATABASE_URL` 设置正确。对于本地开发，使用：
```bash
DATABASE_URL=file:./dev.db
```

### Q: Gemini API 调用失败

**A:** 检查：
1. API 密钥是否正确
2. 是否有网络连接
3. 模型名称是否正确（使用 `gemini-1.5-flash` 而不是 `gemini-3.0-pro`）

### Q: 构建错误

**A:** 尝试：
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Q: 图片上传不工作

**A:**
- 如果没有配置 Cloudinary，确保使用公开可访问的图片 URL
- 或者配置 Cloudinary 凭证

### Q: 认证不工作

**A:**
- 确保 `AUTH_SECRET` 已设置
- 检查数据库表是否正确创建（运行 `npx prisma db push`）
- 对于 OAuth，确保配置了正确的回调 URL

## 下一步

完成快速入门后，你可以：

1. **配置认证**：查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解如何设置 Google OAuth 或 Email 认证

2. **配置图片存储**：设置 Cloudinary 以便上传和存储图片

3. **部署到生产环境**：使用 Vercel 一键部署

4. **自定义配置**：
   - 修改 Gemini 模型和参数（`src/lib/gemini.ts`）
   - 调整 UI 样式（Tailwind CSS）
   - 添加自定义功能

## 获取帮助

- 查看完整文档：[README.md](./README.md)
- 部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 提交问题：GitHub Issues

---

享受使用 Quantum Mirror！ 🚀
