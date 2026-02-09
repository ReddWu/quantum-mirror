'use client';

import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/stores/useSessionStore";

type Message = {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  label?: string;
  isStreaming?: boolean;
};

type JsonChatResponse = {
  safe_block?: boolean;
  message?: string;
  error?: string;
};

type StreamPayload = {
  text?: string;
  reply?: string;
  message?: string;
};

export function ChatPane() {
  const { goal, sessionId, setSession } = useSessionStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function ensureSession() {
      if (!goal?.id) return;
      const res = await fetch("/api/session/today");
      const data = await res.json();
      if (data.exists && data.session) {
        setSession(data.session.id);
      }
    }
    ensureSession();
  }, [goal?.id, setSession]);

  const startSession = async () => {
    if (!goal?.id) return;
    const res = await fetch("/api/session/today", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: goal.id }),
    });
    const data = await res.json();
    if (data.session?.id) setSession(data.session.id);
  };

  const patchMessage = (id: string, updater: (msg: Message) => Message) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? updater(msg) : msg)));
  };

  const parseSseEvent = (rawEvent: string): { event: string; data: string } | null => {
    const trimmed = rawEvent.trim();
    if (!trimmed) return null;

    let event = "message";
    const dataLines: string[] = [];

    for (const line of trimmed.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    return { event, data: dataLines.join("\n") };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !sessionId || !input.trim()) return;

    const now = Date.now();
    const userMessage: Message = {
      id: `${now}`,
      type: "user",
      content: input,
      timestamp: new Date(),
    };
    const assistantMessageId = `${now + 1}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mirror/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          goal: { title: goal.title, description: goal.description },
          user_message: userMessage.content,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data: JsonChatResponse = await res.json();

        if (data.safe_block) {
          patchMessage(assistantMessageId, (msg) => ({
            ...msg,
            content: data.message || "Safety notice triggered",
            label: "Safety Notice",
            isStreaming: false,
          }));
        } else {
          patchMessage(assistantMessageId, (msg) => ({
            ...msg,
            content: data.error || data.message || "Sorry, something went wrong.",
            label: "Error",
            isStreaming: false,
          }));
        }
        return;
      }

      if (!res.body) {
        throw new Error("Missing response body for streamed chat");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawDone = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let eventBreakIndex = buffer.indexOf("\n\n");
        while (eventBreakIndex !== -1) {
          const rawEvent = buffer.slice(0, eventBreakIndex);
          buffer = buffer.slice(eventBreakIndex + 2);

          const parsedEvent = parseSseEvent(rawEvent);
          if (!parsedEvent) {
            eventBreakIndex = buffer.indexOf("\n\n");
            continue;
          }

          let payload: StreamPayload = {};
          if (parsedEvent.data) {
            try {
              payload = JSON.parse(parsedEvent.data) as StreamPayload;
            } catch {
              payload = {};
            }
          }

          if (parsedEvent.event === "delta" && payload.text) {
            patchMessage(assistantMessageId, (msg) => ({
              ...msg,
              content: msg.content + payload.text,
              isStreaming: true,
            }));
          }

          if (parsedEvent.event === "error") {
            patchMessage(assistantMessageId, (msg) => ({
              ...msg,
              content: payload.message || "Failed to stream assistant reply.",
              label: "Error",
              isStreaming: false,
            }));
            sawDone = true;
          }

          if (parsedEvent.event === "done") {
            patchMessage(assistantMessageId, (msg) => ({
              ...msg,
              content: payload.reply || msg.content,
              isStreaming: false,
            }));
            sawDone = true;
          }

          eventBreakIndex = buffer.indexOf("\n\n");
        }
      }

      if (!sawDone) {
        patchMessage(assistantMessageId, (msg) => ({
          ...msg,
          isStreaming: false,
        }));
      }
    } catch (error) {
      console.error("Chat error:", error);
      patchMessage(assistantMessageId, (msg) => ({
        ...msg,
        content: "Sorry, something went wrong. Please try again.",
        label: "Error",
        isStreaming: false,
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!goal) {
    return (
      <div className="flex h-full items-center justify-center p-7">
        <div className="qm-warning max-w-lg p-4 text-sm text-center">
          Please select or create a goal before starting your future-self chat.
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-7 text-center">
        <div className="qm-subtle max-w-lg p-5">
          <h2 className="text-2xl text-[#1f1f1b]">Session not started</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Start today&apos;s session to open your chat thread.</p>
        </div>
        <button onClick={startSession} className="qm-button px-6 py-2.5">
          Start today&apos;s session
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Future self</p>
        <h2 className="mt-1 text-2xl text-[#1f1f1b]">{goal.title}</h2>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#fcfbf7_0%,#f5f2e8_100%)] p-5 sm:p-6">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Prompt
              </div>
              <p className="text-xl font-semibold text-[#1f1f1b]">Start with one honest sentence.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">State what you avoid, what you want, or where today can still be recovered.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[86%] space-y-1 sm:max-w-[70%]">
              {msg.label && <div className="px-1 text-xs font-semibold text-[#8a5f0f]">{msg.label}</div>}
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  msg.type === "user"
                    ? "rounded-tr-md bg-[#1f1f1b] text-white"
                    : "rounded-tl-md border border-[var(--border)] bg-[var(--surface)] text-[#1f1f1b]"
                }`}
              >
                {msg.isStreaming && !msg.content ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                )}
              </div>
              <p className={`px-1 text-xs text-[var(--muted)] ${msg.type === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </section>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <form onSubmit={onSubmit} className="flex items-end gap-3">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="qm-textarea min-h-[48px] max-h-[140px] flex-1 resize-none rounded-3xl px-4"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="qm-button h-12 w-12 rounded-full p-0 text-lg font-semibold"
            aria-label="Send"
          >
            &gt;
          </button>
        </form>
      </footer>
    </div>
  );
}
