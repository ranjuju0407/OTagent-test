// src/agent/ragEngine.ts

import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";

/**
 * 使用本地 Ollama 模型处理 PDF
 * 
 * ⚠️ 前置条件：
 * 1. 确保本地运行 Ollama：启动 Ollama 应用
 * 2. 拉取 embedding 模型：ollama pull nomic-embed-text
 * 3. 模型会在 http://localhost:11434 运行
 */
export const processPDF = async (fileBlob: Blob) => {
  console.log("正在解析 PDF...");
  
  try {
    const loader = new WebPDFLoader(fileBlob, {
      parsedItemSeparator: " ", 
    });
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // 使用本地 Ollama Embedding 模型
    // ⚠️ 确保已执行：ollama pull nomic-embed-text
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text", // 可选其他模型：llama3, mxbai-embed-large 等
      baseUrl: "http://localhost:11434", // 默认端口，通常不用改
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    console.log(`✅ PDF 处理完成，共生成 ${splitDocs.length} 个片段`);
    return vectorStore;
  } catch (error) {
    console.error("❌ PDF 处理失败:", error);
    throw new Error(
      `PDF 处理失败: ${error instanceof Error ? error.message : String(error)}。\n` +
      "请确保:\n" +
      "1. Ollama 已启动\n" +
      "2. 执行过: ollama pull nomic-embed-text"
    );
  }
};

/**
 * 从向量库检索相关文档
 */
export const retrieveDocuments = async (
  vectorStore: MemoryVectorStore,
  question: string,
  k: number = 4
): Promise<string> => {
  try {
    const relevantDocs = await vectorStore.similaritySearch(question, k);
    const context = relevantDocs
      .map(doc => doc.pageContent)
      .join("\n\n---\n\n");
    return context;
  } catch (error) {
    console.error("❌ 文档检索失败:", error);
    return "";
  }
};