# 任务：升级 OTagent 为 LangGraph 架构 (Ollama Embedding + DeepSeek LLM)

## 目标
保持前端 UI (`ChatWindow.tsx`) 核心逻辑不变，重构后端逻辑 (`src/agent/ragEngine.ts`)。
架构调整为：
1. **Embedding**: 使用本地 **Ollama** (模型: `nomic-embed-text` 或其他本地模型)。
2. **LLM**: 使用 **DeepSeek** (通过 LangChain OpenAI Adapter 调用)。
3. **流程控制**: 使用 **LangGraph**。

## 1. 安装/确认依赖
请安装 LangChain 的 Ollama 和 Graph 库：
```bash
npm install @langchain/ollama @langchain/langgraph @langchain/openai @langchain/core

2. 重构 src/agent/ragEngine.ts
请完全重写此文件。

需求细节：

Embeddings: 引入 @langchain/ollama 的 OllamaEmbeddings。默认连接 http://localhost:11434，模型设为 nomic-embed-text (并在注释里提醒用户需先在本地 pull 该模型)。

LLM: 保持使用 ChatOpenAI 配置 DeepSeek。

Graph: 构建 retrieve -> generate 的 StateGraph。

代码参考：
import { ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama"; // 使用 LangChain 的 Ollama 绑定
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { StateGraph, END, START } from "@langchain/langgraph";
import { SystemMessage, BaseMessage } from "@langchain/core/messages";

// --- 1. PDF 处理 (Embedding 阶段) ---
// 注意：现在 Embedding 是本地的，不需要 API Key
export const processPDF = async (fileBlob: Blob) => {
  console.log("正在解析 PDF...");
  const loader = new WebPDFLoader(fileBlob, { parsedItemSeparator: " " });
  const docs = await loader.load();
  
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const splitDocs = await splitter.splitDocuments(docs);
  
  // 使用本地 Ollama 生成向量
  // ⚠️ 用户需确保本地已运行 `ollama pull nomic-embed-text`
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text", // 或者 "llama3", "mxbai-embed-large"
    baseUrl: "http://localhost:11434",
  });

  // 存入内存向量库
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  console.log("向量库构建完成");
  
  return vectorStore;
};

// --- 2. 定义 Graph State ---
interface AgentState {
  messages: BaseMessage[];
  context?: string;
}

// --- 3. 创建 RAG Graph (推理阶段) ---
// 这里仍然需要传入 DeepSeek 的 API Key，因为推理是云端的
export const createRAGGraph = (vectorStore: MemoryVectorStore, deepSeekApiKey: string) => {
  
  // 初始化 DeepSeek 模型
  const llm = new ChatOpenAI({
    modelName: "deepseek-chat",
    openAIApiKey: deepSeekApiKey,
    configuration: {
      baseURL: "[https://api.deepseek.com](https://api.deepseek.com)",
    },
    temperature: 0.3,
  });

  // 检索节点
  const retrieveNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const lastMessage = state.messages[state.messages.length - 1];
    const query = lastMessage.content as string;
    
    const results = await vectorStore.similaritySearch(query, 4);
    const context = results.map(d => d.pageContent).join("\n\n");
    return { context };
  };

  // 生成节点
  const generateNode = async (state: AgentState) => {
    const { messages, context } = state;
    
    const systemPrompt = `你是一个智能助手。请基于以下[参考文档]回答用户问题。
    
    [参考文档]:
    ${context}
    
    如果文档中没有答案，请根据你的知识回答，但要说明不在文档中。`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      ...messages
    ]);
    
    return { messages: [response] };
  };

  // 构建工作流
  const workflow = new StateGraph<AgentState>({
    channels: {
      messages: {
        reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b),
        default: () => [],
      },
      context: {
        reducer: (a: any, b: any) => b,
        default: () => "",
      }
    }
  })
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END);

  return workflow.compile();
};

3. 修改 src/components/ChatWindow.tsx
请同步修改前端调用逻辑：

handleFileChange:

调用 processPDF(file) 时不需要再传 apiKey 了（因为 Embedding 是本地 Ollama 做的）。

记得处理可能的连接错误（例如用户没开 Ollama）。

handleSend:

在创建 Graph 时：createRAGGraph(vectorStore, apiKey) 仍然需要传入 apiKey（这个 Key 是给 DeepSeek 用的）。