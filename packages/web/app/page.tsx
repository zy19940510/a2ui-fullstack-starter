"use client";

import { useState } from "react";
import Link from "next/link";
import { useSSE } from "@/hooks/useSSE";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, isLoading, currentThinking, sendMessage, stop } = useSSE(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      {/* 头部 - 添加天气页面链接 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold dark:text-white">A2UI Chat</h1>
        <Link
          href="/weather"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <span>🌤️</span>
          <span>天气组件演示</span>
        </Link>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 dark:bg-blue-900/30 ml-8"
                : "bg-gray-100 dark:bg-gray-800/50 mr-8"
            }`}
          >
            <div className="font-semibold mb-1 dark:text-gray-200">
              {msg.role === "user" ? "你" : "AI"}
            </div>

            {/* 工具调用展示 */}
            {msg.toolCalls?.map((tool, i) => (
              <div
                key={i}
                className="my-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm"
              >
                {/* 工具头部 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔧</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-200">
                    {tool.name}
                  </span>
                  {tool.isRunning && (
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                      <span className="animate-spin">⏳</span>
                      运行中
                    </span>
                  )}
                  {tool.result && !tool.isRunning && (
                    <span className="ml-auto text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                      ✓ 完成
                    </span>
                  )}
                </div>

                {/* 参数 */}
                {Object.keys(tool.args).length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      参数:
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/40 rounded px-2 py-1.5 text-xs font-mono">
                      {Object.entries(tool.args).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-blue-600 dark:text-blue-400">{key}:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {typeof value === "string"
                              ? value
                              : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 结果 */}
                {tool.result && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      结果:
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      <div className="whitespace-pre-wrap break-words">
                        {tool.result}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 消息内容 */}
            <div className="whitespace-pre-wrap dark:text-gray-200">
              {msg.content}
              {/* processing 时显示跳动的点，有内容流式时也显示 */}
              {(msg.isProcessing || msg.isStreaming) && (
                <span className="inline-flex items-center ml-1 gap-0.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            停止
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            发送
          </button>
        )}
      </form>
    </main>
  );
}