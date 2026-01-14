# OTagent 快速开始指南

## 1️⃣ 安装依赖
```bash
npm install --legacy-peer-deps
```

## 2️⃣ 启动 Ollama（本地向量化）
```bash
# Windows 用户：
# 1. 下载并安装 Ollama：https://ollama.ai
# 2. 拉取 embedding 模型：
ollama pull nomic-embed-text

# 3. 在后台启动 Ollama 服务（自动运行或手动启动）
# Ollama 默认监听：http://localhost:11434
```

## 3️⃣ 配置 DeepSeek API Key
### 方式 A：环境变量（推荐）
```bash
# Windows PowerShell
$env:REACT_APP_DEEPSEEK_API_KEY="sk-your-api-key-here"

# Windows CMD
set REACT_APP_DEEPSEEK_API_KEY=sk-your-api-key-here

# Linux/Mac
export REACT_APP_DEEPSEEK_API_KEY="sk-your-api-key-here"
```

### 方式 B：浏览器 localStorage
打开应用后，在浏览器 DevTools（按 F12）的 Console 中运行：
```javascript
localStorage.setItem('deepseek_api_key', 'sk-your-api-key-here')
```

### 方式 C：.env 文件
1. 复制 `.env.example` 为 `.env`
2. 填入你的 API Key
3. 重启应用

> 从 https://platform.deepseek.com/api_keys 获取你的 API Key

## 4️⃣ 启动开发服务器
```bash
npm start
```

这个命令会：
- 启动 Vite 开发服务器（http://localhost:5173）
- 自动启动 Electron 桌面应用

## 5️⃣ 使用应用

### 上传 PDF
1. 点击左侧栏的"上传 PDF"按钮
2. 选择 PDF 文件
3. 等待向量化完成（"✅ 文献已加载"）

### 提问
1. 在底部输入框输入问题
2. 点击发送按钮或按 Enter
3. 应用会从 PDF 中检索相关内容，然后用 DeepSeek 生成回答

### 无 PDF 聊天
- 不上传 PDF 的情况下，应用会直接调用 DeepSeek 进行普通聊天

## 🚀 构建生产版本
```bash
npm run build
```

生成的应用在 `dist/` 目录中

## ⚠️ 常见问题

### "Ollama 未运行"
```bash
# 检查 Ollama 服务
curl http://localhost:11434/api/tags

# 如果失败，确保 Ollama 已启动
ollama serve
```

### "缺少 embedding 模型"
```bash
# 拉取模型
ollama pull nomic-embed-text

# 列出已有模型
ollama list
```

### "API Key 错误"
- 检查 API Key 是否正确复制
- 确保网络连接正常
- 验证 API Key 未过期

### "生成回答慢"
- 这是正常的，取决于：
  - 网络延迟
  - PDF 大小和向量化时间
  - DeepSeek 服务响应时间

## 📚 更多信息
详见 [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md)

---

**提示**：建议在开发前阅读 [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md) 了解完整的架构变更。
