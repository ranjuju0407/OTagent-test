// src/agent/graph.ts

import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { retrieveDocuments } from "./ragEngine";

/**
 * 初始化 DeepSeek 大模型
 * ⚠️ API Key 需要从环境变量或传入参数获取
 */
const createLLM = (apiKey: string) => {
  return new ChatOpenAI({
    modelName: "deepseek-chat",
    openAIApiKey: apiKey,
    configuration: {
      baseURL: "https://api.deepseek.com/v1",
    },
    temperature: 0.3, // 科研助手建议使用较低的温度，保证准确性
  });
};

/**
 * 主节点：检索 + 生成
 * 
 * 流程：
 * 1. 如果提供了 vectorStore，从 PDF 检索相关内容
 * 2. 将检索结果作为上下文注入到系统提示
 * 3. 调用 DeepSeek 生成回答
 */
const callModel = async (
  state: typeof MessagesAnnotation.State,
  config: any
) => {
  const { messages } = state;
  const vectorStore = config?.configurable?.vectorStore;
  const apiKey = config?.configurable?.apiKey;

  if (!apiKey) {
    throw new Error("⚠️ 缺少 DeepSeek API Key，请在 config.configurable.apiKey 中提供");
  }

  const llm = createLLM(apiKey);

  // 获取用户最新问题
  const lastMessage = messages[messages.length - 1];
  const question =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : String(lastMessage.content);

  // 如果有向量库，从 PDF 中检索相关内容
  let context = "";
  if (vectorStore) {
    try {
      context = await retrieveDocuments(vectorStore, question);
    } catch (e) {
      console.warn("检索文档失败，将继续使用无上下文模式:", e);
    }
  }

  // 构建系统提示（包含检索到的上下文）
  const systemPrompt = `你是一个专业的科研助手。请基于【参考文档】回答用户问题。

【参考文档】：
${context || "（无上传的文档）"}

如果文档中没有答案，请根据你的知识回答，但要明确说明该信息不在文档中。`;

  // 调用 DeepSeek
  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    ...messages,
  ]);

  return { messages: [response] };
};

/**
 * 构建并编译 LangGraph 工作流
 */
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

export const graph = workflow.compile();