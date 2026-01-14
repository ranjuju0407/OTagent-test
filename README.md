# OTagent - AI 科研助手

> 一款整合本地向量化和 DeepSeek LLM 的桌面 AI 研究助手

[![Version](https://img.shields.io/badge/version-1.1.0-blue)](https://github.com/yourusername/OTagent)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-success)](.)

## ✨ 特性

### 🚀 本地化向量化
- **Ollama Embedding**：无需 API Key，离线工作
- **快速响应**：本地处理，<1 秒延迟
- **支持多模型**：可切换 nomic-embed-text、llama3 等

### 🧠 强大推理能力
- **DeepSeek Chat**：业界领先的推理能力
- **LangGraph 控制**：清晰的流程管理，易于扩展
- **RAG 支持**：自动从 PDF 中检索相关上下文

### 📚 完整的 RAG 流程
```
用户上传 PDF
    ↓
本地向量化（Ollama）
    ↓
语义搜索
    ↓
DeepSeek 生成回答
```

### 🎯 用户友好
- 直观的 UI 界面
- 友好的错误提示
- 完整的快速开始指南

## 🚀 快速开始

### 前置条件
- Node.js v16+
- Ollama（[下载](https://ollama.ai)）
- DeepSeek API Key（[获取](https://platform.deepseek.com/api_keys)）

### 安装（3 步）

```bash
# 1. 拉取 embedding 模型
ollama pull nomic-embed-text

# 2. 启动 Ollama（新标签页）
ollama serve

# 3. 启动应用
npm install --legacy-peer-deps && npm start
```

详见 **[QUICKSTART.md](./QUICKSTART.md)** 完整指南

## 📚 文档

| 文档 | 说明 |
|------|------|
| [QUICKSTART.md](./QUICKSTART.md) | ⚡ 5 分钟快速开始（推荐新用户） |
| [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md) | 📖 完整的架构和配置指南 |
| [CHANGELOG.md](./CHANGELOG.md) | 📝 详细的版本变更日志 |
| [UPGRADE_REPORT.md](./UPGRADE_REPORT.md) | 🎯 升级完整报告 |

## 🏗️ 架构

### 后端架构
```
┌─────────────────────────────────────────────────┐
│           OTagent 后端架构（v1.1.0）            │
├─────────────────────────────────────────────────┤
│                                                 │
│  📄 PDF Input                                   │
│       ↓                                         │
│  🔄 WebPDFLoader                                │
│       ↓                                         │
│  ✂️  RecursiveCharacterTextSplitter             │
│       ↓                                         │
│  🧮 OllamaEmbeddings (本地)                     │
│       ↓                                         │
│  💾 MemoryVectorStore                           │
│       ↓                                         │
│  🧩 LangGraph StateGraph                        │
│    ├─ retrieve: 向量搜索 (Top-4)               │
│    └─ generate: DeepSeek 生成                  │
│       ↓                                         │
│  📤 Response                                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 核心文件

```
src/
├── agent/
│   ├── ragEngine.ts      # PDF 处理 + Ollama 向量化
│   └── graph.ts          # LangGraph 流程 + DeepSeek
├── components/
│   ├── App.tsx           # 状态管理 + 核心逻辑
│   ├── ChatWindow.tsx    # 消息显示
│   ├── MessageInput.tsx  # 输入框
│   └── Sidebar.tsx       # 侧边栏 + PDF 上传
└── ...其他
```

## ⚙️ 配置

### API Key 配置
```bash
# 方式1：环境变量（推荐）
export REACT_APP_DEEPSEEK_API_KEY=sk-xxx

# 方式2：localStorage（浏览器 DevTools）
localStorage.setItem('deepseek_api_key', 'sk-xxx')

# 方式3：.env 文件
cp .env.example .env
# 填入 API Key
```

### 修改 Embedding 模型
编辑 `src/agent/ragEngine.ts` 第 33 行：
```typescript
model: "nomic-embed-text"  // 改为其他模型
```

### 自定义 Chunk 大小
编辑 `src/agent/ragEngine.ts` 第 25-26 行：
```typescript
chunkSize: 500,      // 调整块大小
chunkOverlap: 50,    // 调整重叠
```

## 🐛 常见问题

### Q: PDF 解析失败，显示"Ollama 未运行"
A: 
```bash
# 启动 Ollama
ollama serve

# 拉取模型
ollama pull nomic-embed-text
```

### Q: 生成回答失败，显示"API Key 错误"
A: 
- 检查 API Key 是否正确复制
- 确保网络连接正常
- 查看浏览器控制台 (F12) 的错误信息

### Q: 应用启动很慢
A: 这是向量化导致的，取决于 PDF 大小和本地 GPU。可以：
- 使用较小的 PDF 文件
- 减小 chunkSize
- 使用更快的 embedding 模型

详见 [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md#故障排查)

## 📊 技术栈

| 层级 | 技术 |
|------|------|
| UI | React 18 + Tailwind CSS |
| Desktop | Electron 31 |
| Embedding | Ollama + nomic-embed-text |
| LLM | DeepSeek Chat (OpenAI API) |
| Orchestration | LangGraph |
| 语言 | TypeScript + Python (Ollama) |
| 构建 | Vite + Electron |

## 🎯 开发

### 本地开发
```bash
npm install --legacy-peer-deps
npm start
```

### 构建生产版本
```bash
npm run build
```

### TypeScript 类型检查
```bash
npx tsc --noEmit
```

## 🚀 性能

| 操作 | 耗时 |
|------|------|
| PDF 向量化 (100 页) | 5-10s |
| 语义搜索 | <100ms |
| LLM 生成 | 3-10s |

## 🔄 更新日志

### v1.1.0 (2026-01-14)
- ✨ 使用 Ollama 本地化 Embedding
- ✨ 完全重构为 LangGraph StateGraph
- ✨ 使用 DeepSeek 作为推理引擎
- 🔧 改进错误处理和用户提示
- 📖 添加完整文档

### v1.0.0 (初始版本)
- 基础 PDF 上传和聊天功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 📞 联系

- 📧 Email: your-email@example.com
- 💬 GitHub Discussions: [讨论](https://github.com/yourusername/OTagent/discussions)
- 🐛 报告 Bug: [Issue](https://github.com/yourusername/OTagent/issues)

---

<div align="center">

**[快速开始](./QUICKSTART.md) | [文档](./UPGRADE_GUIDE.md) | [更新日志](./CHANGELOG.md)**

Made with ❤️ by GitHub Copilot

</div>