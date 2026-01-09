import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

function App() {
  // 1. 定义当前选中的对话 ID
  const [activeChatId, setActiveChatId] = useState(1);
  // 控制侧边栏收起的状态
  const [isCollapsed, setIsCollapsed] = useState(false); 

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* ✅ 修复点 1：Prop 名字必须和 Sidebar.tsx 里定义的一模一样 
        setISCollapse -> setIsCollapsed
      */}
      <Sidebar 
        activeChatId={activeChatId} 
        onSelectChat={setActiveChatId} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      <div className="flex-1 flex flex-col relative transition-all duration-300">
        {/* ✅ 修复点 2：删除了 isSidebarCollapsed 属性
          ChatWindow 不需要知道侧边栏是否收起，因为父级 div (flex-1) 会自动占满剩余空间
        */}
        <ChatWindow chatId={activeChatId} />
      </div>
    </div>
  );
}

export default App;