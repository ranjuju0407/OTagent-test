import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App' // 确保路径正确
import "./index.css"; // 确保这里只有一个点，且 src 目录下确实有这个文件

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)