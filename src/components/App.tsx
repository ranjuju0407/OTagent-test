// src/components/App.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { processPDF } from '../agent/ragEngine';
import { graph } from '../agent/graph';
import { HumanMessage } from "@langchain/core/messages";

// 定义消息类型
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [activeChatId, setActiveChatId] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // --- 核心状态管理 ---
  const [vectorStore, setVectorStore] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // DeepSeek API Key - 从环境变量读取，或允许用户输入
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY ||
                 import.meta.env.DEEPSEEK_API_KEY ||
                 localStorage.getItem('deepseek_api_key') ||
                 "";

  // 处理文件上传 - 使用本地 Ollama 处理 PDF
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      console.log("📁 开始处理文件:", file.name);
      
      const { processPDF } = await import('../agent/ragEngine');
      const store = await processPDF(file);
      setVectorStore(store);
      
      const sysMsg: Message = { 
        role: 'assistant', 
        content: `✅ 文献《${file.name}》已加载到向量库。现在你可以基于它提问了。` 
      };
      setMessages(prev => [...prev, sysMsg]);
      
    } catch (e: any) {
      console.error("❌ 文件处理失败:", e);
      const errorContent = e instanceof Error ? e.message : String(e);
      const errorMsg: Message = { 
        role: 'assistant', 
        content: `⚠️ PDF 处理失败: ${errorContent}\n\n请检查：\n1. Ollama 是否已启动\n2. 是否执行过: ollama pull nomic-embed-text` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理发送消息 - 使用 DeepSeek 生成回答
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // 检查 API Key
    if (!apiKey) {
      alert(
        "⚠️ 缺少 DeepSeek API Key\n\n" +
        "请通过以下方式之一提供:\n" +
        "1. 设置环境变量: REACT_APP_DEEPSEEK_API_KEY\n" +
        "2. 在浏览器 localStorage 中设置: localStorage.setItem('deepseek_api_key', 'sk-xxx')"
      );
      return;
    }

    // 立即显示用户消息
    const userMsg: Message = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // 转换消息格式为 LangChain 格式
      const [{ graph }, { HumanMessage }] = await Promise.all([
        import('../agent/graph'),
        import('@langchain/core/messages'),
      ]);
      const langChainMessages = newHistory.map(m => new HumanMessage(m.content));

      // 调用 DeepSeek Agent（传入 vectorStore 和 apiKey）
      const result = await graph.invoke(
        { messages: langChainMessages }, 
        { 
          configurable: { 
            vectorStore: vectorStore,
            apiKey: apiKey
          } 
        }
      );

      // 获取 AI 的回答
      const aiContent = result.messages[result.messages.length - 1].content;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiContent as string 
      }]);

    } catch (e: any) {
      console.error("❌ 生成回答失败:", e);
      const errorMsg: Message = { 
        role: 'assistant', 
        content: `⚠️ 生成回答失败: ${e instanceof Error ? e.message : String(e)}\n\n请检查:\n1. DeepSeek API Key 是否正确\n2. 网络连接是否正常` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar 
        activeChatId={activeChatId} 
        onSelectChat={setActiveChatId} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onFileUpload={handleFileUpload} 
      />
      
      <div className="flex-1 flex flex-col relative transition-all duration-300">
        <ChatWindow 
          chatId={activeChatId}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;