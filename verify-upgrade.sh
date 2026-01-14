#!/bin/bash
# OTagent 升级验证脚本

echo "🔍 OTagent LangGraph 架构升级验证"
echo "========================================"
echo ""

# 检查 TypeScript 编译
echo "1️⃣  TypeScript 编译检查..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ TypeScript 编译通过"
else
  echo "❌ TypeScript 编译失败"
  exit 1
fi
echo ""

# 检查 Ollama 连接
echo "2️⃣  Ollama 服务检查..."
curl -s http://localhost:11434/api/tags > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Ollama 已连接"
  echo "   模型列表："
  curl -s http://localhost:11434/api/tags | jq '.models[].name' 2>/dev/null || echo "   (无法解析模型列表)"
else
  echo "⚠️  Ollama 未响应（http://localhost:11434）"
  echo "   → 请启动 Ollama: ollama serve"
  echo "   → 或拉取模型: ollama pull nomic-embed-text"
fi
echo ""

# 检查 API Key
echo "3️⃣  DeepSeek API Key 检查..."
if [ -z "$REACT_APP_DEEPSEEK_API_KEY" ]; then
  echo "⚠️  环境变量 REACT_APP_DEEPSEEK_API_KEY 未设置"
  echo "   → 执行: export REACT_APP_DEEPSEEK_API_KEY=sk-xxx"
else
  echo "✅ API Key 已配置"
fi
echo ""

# 检查关键文件
echo "4️⃣  关键文件检查..."
files=(
  "src/agent/ragEngine.ts"
  "src/agent/graph.ts"
  "src/components/App.tsx"
  "tsconfig.json"
  "UPGRADE_GUIDE.md"
  "QUICKSTART.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file 缺失"
  fi
done
echo ""

echo "========================================"
echo "✅ 升级验证完成"
echo ""
echo "📚 下一步："
echo "  1. 阅读 QUICKSTART.md"
echo "  2. 配置 DeepSeek API Key"
echo "  3. 启动 Ollama 服务"
echo "  4. 执行: npm start"
echo ""
