// src/agent/ragEngine.ts

// 1. 改用 WebPDFLoader (专门用于浏览器/前端环境)
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Ollama, OllamaEmbedding, Settings } from "llamaindex";

// 定义文档接口
interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

// ✅ 修改：接收 Blob (文件对象) 而不是 string (路径)
export const processPDF = async (fileBlob: Blob, apiKey: string) => {
  console.log("正在解析 PDF Blob...");
  
  // 1. 加载 PDF (Web 模式)
  const loader = new WebPDFLoader(fileBlob, {
    // 必须保留，防止 pdfjs 解析报错
    parsedItemSeparator: " ", 
  });
  const docs = await loader.load();

  // 2. 切割文本
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, //稍微改小一点，检索更精准
    chunkOverlap: 50,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  // 3. 存入向量库
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    new OpenAIEmbeddings({
      openAIApiKey: apiKey, 
      // 如果你后面要换本地模型，这里可以改
    })
  );

  console.log("PDF 处理完成，共生成片段:", splitDocs.length);
  return vectorStore;
};

// 检索函数保持不变
export const queryPDF = async (vectorStore: any, question: string) => {
  const relevantDocs = await vectorStore.similaritySearch(question, 4); // 找4个相关片段
  const context = relevantDocs.map((d: Document) => d.pageContent).join("\n\n---\n\n");
  return context;
};