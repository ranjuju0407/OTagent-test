import React from 'react';
import MessageInput from './MessageInput';
import { Message } from './App'; // 引用 App 里定义的类型

interface ChatWindowProps {
  // 1. 接收来自 App 的数据
  chatId: number;
  messages: Message[]; 
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chatId, 
  messages, 
  onSendMessage, 
  isLoading 
}) => {
 
  return (
    <div className="flex flex-col h-full relative bg-gray-50">
      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 如果没有消息，显示欢迎语 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <p>👋 你好！我是你的科研助手。</p>
            <p className="text-sm">请在左侧侧边栏上传 PDF，或直接在下方提问。</p>
          </div>
        )}
        
        {/* 渲染消息 */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {/* 简单的换行处理 */}
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          </div>
        ))}
        
        {/* 加载中提示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 text-sm p-3 rounded-lg animate-pulse">
              正在思考中...
            </div>
          </div>
        )}
      </div>

      {/* 底部输入框区域 */}
      <div className="p-4 border-t bg-white">
        {/* 直接使用封装好的 Input 组件，禁用状态由父组件控制 */}
        <MessageInput onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;