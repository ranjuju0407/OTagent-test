import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // shim ansi-styles to provide a default export for ESM consumers
      'ansi-styles': resolve(process.cwd(), 'src/shims/ansi-styles-shim.js')
    }
  },
  define: {
    // 填补某些旧包对 Node.js 全局变量的依赖
    'process.env': {},
    'global': 'globalThis'
  },
  optimizeDeps: {
    // 【核弹名单】强制 Vite 预构建所有这些包，解决 "no export named default"
    include: [
      'camelcase', 
      'decamelize', 
      'p-queue', 
      'p-retry', 
      'uuid', 
      'js-yaml',
      'lucide-react',
      'flat',
      // 下面是针对 langsmith/semver 的预构建，避免运行时 ESM/CJS 导出不匹配
      'langsmith',
      'semver',
      'ansi-styles'
    ],
    // 排除核心包，防止 Node 代码泄露到浏览器
    exclude: ['@langchain/community', '@langchain/core']
  },
  build: {
    commonjsOptions: {
      // 允许 CJS 和 ESM 混用，这是兼容老包的关键
      transformMixedEsModules: true, 
    }
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false // 关掉那个烦人的全屏错误覆盖层，只看控制台
    }
  }
});