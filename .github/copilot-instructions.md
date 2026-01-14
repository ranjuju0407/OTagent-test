# OTagent Copilot Instructions

## Architecture Overview

OTagent is an Electron desktop AI research assistant that combines PDF analysis with LangChain-based agent reasoning. The app has three core layers:

**UI Layer** (React + Tailwind): `src/components/` - ChatWindow renders messages, MessageInput handles text/file input, Sidebar manages chat history, App orchestrates state.

**RAG Engine** (`src/agent/ragEngine.ts`): Processes PDFs into vector embeddings using OllamaEmbeddings (local model `nomic-embed-text` on `localhost:11434`), stores in MemoryVectorStore, retrieves context via similarity search.

**Agent Layer** (`src/agent/graph.ts`): LangGraph workflow with ChatOpenAI (DeepSeek at `api.deepseek.com/v1`) as the reasoning engine. Takes vectorStore via config context, injects PDF context into system prompt, returns streamed responses.

## Critical Data Flows

1. **PDF Upload**: File → `handleFileUpload()` → `processPDF()` (WebPDFLoader → RecursiveCharacterTextSplitter with 500 char chunks) → OllamaEmbeddings → MemoryVectorStore stored in state
2. **Chat with RAG**: User message → `handleSendMessage()` → `graph.invoke()` with configurable vectorStore → if vectorStore exists, `retrieveDocuments()` fetches top-4 similar chunks, injected into system prompt → DeepSeek responds
3. **Chat without RAG**: Same flow without vectorStore = plain conversation

## Key Dependencies & External Services

- **DeepSeek API**: Configured in `graph.ts` with hardcoded key (⚠️ move to env var). Set `temperature: 0.3` for academic precision.
- **Ollama Local**: Must be running on `http://localhost:11434` with `nomic-embed-text` model pulled. No API key needed.
- **LangChain Community**: PDF loading, text splitting, OllamaEmbeddings, MemoryVectorStore
- **Electron**: Main process in `main.js` waits for Vite dev server on `http://localhost:5173` then loads it

## Development Workflow

**Start dev**: `npm start` runs `vite` + `electron` concurrently. Vite hot-reloads React, Electron reloads manually (no auto-reload configured).

**Build**: `npm run build` → TypeScript compilation → Vite bundle → produces desktop app.

**Debugging**: Check Electron console and browser DevTools (Cmd+Option+I). Ollama issues surface as "API Key or Ollama not running" in error messages.

## Code Patterns & Conventions

**State Management**: App.tsx is the state hub. Messages in UI format `{role, content}`, converted to LangChain format `HumanMessage`/`SystemMessage` when passing to agent.

**Message Types**: 
- UI: `interface Message { role: 'user'|'assistant', content: string }`
- LangChain: `HumanMessage`, `SystemMessage`, `AIMessage`

**Vector Store**: Passed via LangGraph config `{ configurable: { vectorStore } }`, NOT in state. If null, RAG context is empty string (graceful degradation).

**Error Handling**: Wrap async operations in try-catch; display user-friendly messages in chat (e.g., "⚠️ 发生错误").

## File Structure & Key Files

- `src/components/App.tsx` - State orchestration, message flow to graph agent
- `src/agent/graph.ts` - LangGraph workflow, DeepSeek configuration
- `src/agent/ragEngine.ts` - PDF processing, Ollama embeddings, vector similarity search
- `src/components/ChatWindow.tsx` - Message display with role-based styling
- `main.js` - Electron entry point, loads Vite dev server
- `tailwind.config.js` - Minimal Tailwind config, extend in theme if needed

## Common Modifications

- **Change embedding model**: Update `new OllamaEmbeddings({ model: "..." })` in ragEngine.ts
- **Change reasoning model**: Modify `modelName` and `openAIApiKey` in graph.ts + baseURL if not DeepSeek
- **Adjust chunk size**: Change `chunkSize: 500, chunkOverlap: 50` in processPDF()
- **System prompt tuning**: Edit the `systemPrompt` string in callModel() function
- **UI styling**: Modify className attributes in components; Tailwind already configured

## Known Constraints

- MemoryVectorStore is ephemeral; PDF vectors lost on app restart (not persisted to disk)
- Single simultaneous PDF (overwrites previous vectorStore, no multi-document support)
- Hardcoded `isLoading` disables MessageInput during agent thinking; no background message queueing
- No session persistence; chat history resets on app restart
