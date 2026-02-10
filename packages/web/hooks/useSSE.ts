import { useState, useCallback, useRef } from "react";

export interface SSEEvent {
  event:
    | "processing"
    | "tool_call"
    | "tool_result"
    | "message"
    | "a2ui"
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
    id: string; // 工具调用的唯一 ID
    name: string;
    args: any;
    result?: string;
    isRunning?: boolean; // 工具是否正在运行
  }>;
  isStreaming?: boolean;
  isProcessing?: boolean; // 是否在处理中（显示光标）
}

export function useSSE(
  apiUrl: string,
  onA2UIMessage?: (message: any) => void,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // 每次 sendMessage 代表一轮对话，用于将 a2ui 事件绑定到正确的 assistant 消息。
  const activeAssistantIdRef = useRef<string | null>(null);

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
      activeAssistantIdRef.current = assistantId;
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

        // 清理 active assistant id，避免下一轮误绑定
        if (activeAssistantIdRef.current === assistantId) {
          activeAssistantIdRef.current = null;
        }
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
                        id: event.data.id, // 保存工具调用的唯一 ID
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
            // 根据 ID 精确匹配并更新对应的工具调用结果
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId && m.toolCalls?.length) {
                  const toolCalls = m.toolCalls.map((tool) => {
                    // 找到匹配 ID 的工具调用
                    if (tool.id === event.data.id) {
                      return {
                        ...tool,
                        result: event.data.content.result,
                        isRunning: false, // 标记为已完成
                      };
                    }
                    return tool;
                  });
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
          case "a2ui":
            // A2UI 消息回调
            if (onA2UIMessage) {
              onA2UIMessage({
                ...event.data,
                // 透传给 UI 层：这条 a2ui 事件属于哪条 assistant 消息
                __assistantMessageId: activeAssistantIdRef.current,
              });
            }
            break;
        }
      }
    },
    [apiUrl, onA2UIMessage],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { messages, isLoading, currentThinking, sendMessage, stop };
}
