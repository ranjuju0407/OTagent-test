import React, { useRef } from 'react';
import { Paperclip, Send, Globe } from 'lucide-react';

const MessageInput = ({ onSend, disabled = false }: { onSend: (text: string, file?: File) => void; disabled?: boolean }) => {
  const [input, setInput] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 pb-8">
      <div className="relative bg-gray-50 rounded-2xl border border-gray-200 p-2 shadow-sm">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="给 OTagent 发送消息..."
          className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-12 text-gray-700 disabled:opacity-50"
        />
        
        {/* 左侧附件按钮 */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-50"
        >
          <Paperclip size={20} />
          <input type="file" ref={fileInputRef} hidden accept=".pdf" />
        </button>

        {/* 右侧功能按钮组 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <button className="text-gray-400 hover:text-blue-500"><Globe size={20} /></button>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="bg-black text-white p-1.5 rounded-full disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-2">
        OTagent 可能会犯错。请核查重要信息。
      </p>
    </div>
  );
};

export default MessageInput;