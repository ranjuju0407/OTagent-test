import React, { useState, useRef } from 'react';
import { Paperclip, Send, Globe, FileText, X } from 'lucide-react';
import { processPDF, queryPDF } from '../agent/ragEngine'; 

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatWindow = ({ chatId }: { chatId: number }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好！我是 OTagent，有什么我可以帮你的吗？' }
  ]);
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ 新增：存储向量库（大脑）和 API Key
  const [vectorStore, setVectorStore] = useState<any>(null);
  // ⚠️ 请务必确保这里的 Key 是有效的，或者从 import.meta.env.VITE_OPENAI_API_KEY 读取
  const [apiKey] = useState("你的_OPENAI_API_KEY"); 

  // ❌ 删除：旧的 extractTextFromPDF 函数
  // const extractTextFromPDF = ... (整段删除)

  // ✅ 新增：处理文件上传（并在后台建立索引）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    // 提示用户正在处理
    setMessages(prev => [...prev, { role: 'assistant', content: `正在阅读文档《${file.name}》，请稍候...` }]);
    setIsLoading(true);

    try {
      // 调用 RAG 引擎处理 PDF
      const store = await processPDF(file, apiKey);
      setVectorStore(store);
      setMessages(prev => [...prev, { role: 'assistant', content: '✅ 文档阅读完毕！现在你可以基于文档提问了。' }]);
    } catch (error) {
      console.error("PDF 处理失败:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ 文档解析失败，请检查 API Key 或文件格式。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 调用 DeepSeek API (保持基本不变，但建议把 URL 抽离)
  const fetchDeepSeekResponse = async (prompt: string) => {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ⚠️ 注意：DeepSeek 的 API Key
        "Authorization": `Bearer sk-0dce247d81984f8685cb103a4f7ef9c0` 
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
           // 这里可以优化：把历史消息 messages 也带上，实现多轮对话
           ...messages.map(m => ({ role: m.role, content: m.content })), 
           { role: "user", content: prompt }
        ],
        stream: false
      })
    });
    
    if (!response.ok) throw new Error('API 请求失败');
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userDisplayText = input;
    // 先显示用户消息
    setMessages(prev => [...prev, { role: 'user', content: userDisplayText }]);
    setIsLoading(true);
    setInput('');

    let finalPrompt = userDisplayText;

    try {
      // ✅ 修改：RAG 检索逻辑
      // 如果有向量库（说明之前上传了文件），先去检索相关内容
      if (vectorStore) {
        console.log("正在检索向量库...");
        // 1. 在文档里找答案线索
        const context = await queryPDF(vectorStore, userDisplayText);
        
        // 2. 组装成“增强版”Prompt
        finalPrompt = `你是一个智能助手。请根据以下[参考文档]的内容回答[用户问题]。如果不相关，请忽略文档。
        
        [参考文档]:
        ${context}
        
        [用户问题]: 
        ${userDisplayText}`;
      }

      // 3. 发送给 LLM
      const aiContent = await fetchDeepSeekResponse(finalPrompt);
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
      
    } catch (error) {
      console.error("发送失败:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "抱歉，处理消息时出错了。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 消息展示区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-3xl mx-auto flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full border flex items-center justify-center bg-white shadow-sm">
                <span className="text-[10px] font-bold">OT</span>
              </div>
            )}
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-gray-100 text-gray-800' : 'text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="max-w-3xl mx-auto text-gray-400 text-sm italic">OTagent 正在思考...</div>}
      </div>

      {/* 输入区域 */}
      <div className="max-w-3xl mx-auto w-full p-4 pb-8">
        <div className="relative bg-[#f4f4f4] rounded-3xl border border-transparent focus-within:border-gray-300 transition-all p-2">
          
          {/* 已选文件预览标签 */}
          {attachedFile && (
            <div className="flex items-center gap-2 bg-white w-fit ml-10 mb-2 p-2 rounded-xl border border-gray-200 shadow-sm">
              <FileText size={16} className="text-red-500" />
              <span className="text-xs truncate max-w-[150px] font-medium">{attachedFile.name}</span>
              <button onClick={() => {
                  setAttachedFile(null);
                  setVectorStore(null); // 删除文件时也清空大脑
              }} className="hover:bg-gray-100 rounded-full p-0.5">
                <X size={14} />
              </button>
            </div>
          )}

          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="给 OTagent 发送消息..."
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3 px-12 text-gray-700"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-4 bottom-5 text-gray-500 hover:text-black transition-colors"
          >
            <Paperclip size={20} />
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept=".pdf" 
              // ✅ 修改：绑定新的处理函数
              onChange={handleFileChange}
            />
          </button>

          <div className="absolute right-4 bottom-4 flex items-center gap-3">
            <button className="text-gray-400 hover:text-blue-500"><Globe size={20} /></button>
            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="bg-black text-white p-2 rounded-full disabled:opacity-20 transition-opacity"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3 font-light">
          OTagent 可能会犯错。请核查重要信息。
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;