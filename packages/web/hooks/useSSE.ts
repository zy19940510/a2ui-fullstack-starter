import { useState, useCallback, useRef } from "react";

export interface SSEEvent {
  event:
    | "processing"
    | "tool_call"
    | "tool_result"
    | "message"
    | "error"
    | "done";
  data: {
    id: string;
    content: any;
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{
    name: string;
    args: any;
    result?: string;
    isRunning?: boolean; // 工具是否正在运行
  }>;
  isStreaming?: boolean;
  isProcessing?: boolean; // 是否在处理中（显示光标）
}

export function useSSE(apiUrl: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      // 添加用户消息
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // 创建助手消息占位
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        toolCalls: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(`${apiUrl}/api/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
          signal: abortControllerRef.current.signal,
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEventType = "message";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEventType = line.slice(6).trim();
              continue;
            }
            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.slice(5).trim());
                handleSSEEvent({
                  event: currentEventType as SSEEvent["event"],
                  data,
                });
              } catch (e) {
                // ignore parse errors
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("SSE Error:", error);
        }
      } finally {
        setIsLoading(false);
        setCurrentThinking(null);
        // 标记流式完成
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        );
      }

      function handleSSEEvent(event: SSEEvent) {
        switch (event.event) {
          case "processing":
            // 显示光标 loading
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, isProcessing: true } : m,
              ),
            );
            setCurrentThinking(null);
            break;
          case "tool_call":
            // 添加工具调用，标记为运行中
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId) {
                  return {
                    ...m,
                    isProcessing: false, // 停止光标
                    toolCalls: [
                      ...(m.toolCalls || []),
                      {
                        name: event.data.content.name,
                        args: event.data.content.args,
                        isRunning: true, // 标记为运行中
                      },
                    ],
                  };
                }
                return m;
              }),
            );
            break;
          case "tool_result":
            // 更新最后一个工具调用的结果
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId && m.toolCalls?.length) {
                  const toolCalls = [...m.toolCalls];
                  const lastTool = toolCalls[toolCalls.length - 1];
                  toolCalls[toolCalls.length - 1] = {
                    ...lastTool,
                    result: event.data.content.result,
                    isRunning: false, // 标记为已完成
                  };
                  return { ...m, toolCalls };
                }
                return m;
              }),
            );
            break;
          case "message":
            // 显示消息，开启流式
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId) {
                  return {
                    ...m,
                    content: m.content + event.data.content.chunk,
                    isProcessing: false, // 有消息时停止 processing
                  };
                }
                return m;
              }),
            );
            break;
          case "done":
            setIsLoading(false);
            break;
        }
      }
    },
    [apiUrl],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { messages, isLoading, currentThinking, sendMessage, stop };
}