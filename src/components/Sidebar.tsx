import React from 'react';
import { Search, PenBox, PanelLeft } from 'lucide-react';

// 接收父组件传来的 Props
const Sidebar = ({ activeChatId, onSelectChat, isCollapsed, setIsCollapsed }) => {
  const history = [
    { id: 1, title: 'Friendly professional...', group: 'Today' },
    { id: 2, title: 'Brainstorming Bl...', group: 'Today' },
    { id: 3, title: 'Cover letter crafting', group: 'Yesterday' },
    { id: 4, title: 'Designing a Compellin...', group: 'Previous 7 Days' },
  ];

  // 1. 处理收起状态 (Collapsed State)
  if (isCollapsed) {
    return (
      <div className="w-0 overflow-hidden transition-all duration-300 relative bg-[#f9f9f9]">
        <button 
          onClick={() => setIsCollapsed(false)} // 这里的名字必须和 Props 里的一致
          className="absolute left-4 top-4 p-2 bg-white border border-gray-200 rounded-lg z-50 shadow-sm hover:bg-gray-100"
        >
          <PanelLeft size={20} />
        </button>
      </div>
    );
  }

  // 2. 处理展开状态 (Expanded State)
  return (
    <div className="w-[260px] bg-[#f9f9f9] h-full flex flex-col p-3 border-r border-gray-200 transition-all duration-300">
      
      {/* 顶部按钮区 */}
      <div className="flex justify-between items-center mb-6 px-2">
        <button onClick={() => setIsCollapsed(true)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600">
          <PanelLeft size={20} />
        </button>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"><Search size={20} /></button>
          <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"><PenBox size={20} /></button>
        </div>
      </div>

      {/* 历史记录列表 - 核心修复：放在 flex-1 的容器里，让它占据中间所有空间 */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {['Today', 'Yesterday', 'Previous 7 Days'].map((group) => (
          <div key={group}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 mb-2">{group}</h3>
            {history.filter(item => item.group === group).map(item => (
              <div 
                key={item.id} 
                onClick={() => onSelectChat(item.id)}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer truncate transition-colors ${
                  item.id === activeChatId ? 'bg-gray-200 font-medium' : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                {item.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 底部用户信息 - 修复：只保留 Upgrade */}
      <div className="mt-auto p-2 border-t border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">OT</div>
        <span className="text-sm font-medium">Upgrade</span>
      </div>

    </div>
  );
};

export default Sidebar;