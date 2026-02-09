'use client';

import { useEffect, useState, useRef } from "react";
import { useSessionStore } from "@/stores/useSessionStore";

type Message = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  label?: string; // For assistant messages: "Future Self Reply", "Gentle Challenge", etc.
};

type ChatResponse = {
  reply: string;
  gentle_challenge_question: string;
  narrative_rewrite: string;
  next_step?: { suggest_photo_anchor: boolean; suggest_action_collapse: boolean };
  safe_block?: boolean;
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !sessionId || !input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
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
      
      const data: ChatResponse = await res.json();
      
      if (data.safe_block) {
        const safetyMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message || "Safety notice triggered",
          timestamp: new Date(),
          label: "Safety Notice",
        };
        setMessages(prev => [...prev, safetyMessage]);
      } else {
        const aiMessages: Message[] = [
          {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.reply,
            timestamp: new Date(),
            label: "Future Self",
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'assistant',
            content: data.gentle_challenge_question,
            timestamp: new Date(),
            label: "Gentle Challenge",
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'assistant',
            content: data.narrative_rewrite,
            timestamp: new Date(),
            label: "Narrative Rewrite",
          },
        ];
        setMessages(prev => [...prev, ...aiMessages]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
        label: "Error",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!goal) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm text-amber-800">
          Please select or create a goal to start chatting with your future self.
        </p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center">
        <p className="text-sm text-indigo-700">
          Today&apos;s session hasn&apos;t started yet.
        </p>
        <button
          onClick={startSession}
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Start today&apos;s session
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#F5EFE6] to-[#E8DFD0]">
      {/* Chat Header */}
      <div className="border-b border-[#D4C5B0] bg-[#E07B39] px-4 py-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-semibold text-white">Future Self</h2>
            <p className="truncate text-sm text-white/80">{goal.title}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#B4C7B4]/30">
                <svg className="h-10 w-10 text-[#6B8E6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-base text-[#6B8E6B] font-medium">
                Start a conversation with your future self
              </p>
              <p className="mt-2 text-sm text-[#A0B0A0]">
                Share your thoughts, concerns, or questions
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`group relative max-w-[80%] space-y-1 sm:max-w-lg ${
                msg.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.label && (
                <div className="px-4 text-xs font-medium text-[#8B9E8B]">
                  {msg.label}
                </div>
              )}
              <div
                className={`rounded-2xl px-5 py-3 shadow-sm ${
                  msg.type === 'user'
                    ? 'rounded-tr-sm bg-[#E07B39] text-white'
                    : 'rounded-tl-sm bg-white text-[#3D3D3D] ring-1 ring-[#D4C5B0]'
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {msg.content}
                </p>
              </div>
              <div
                className={`px-4 text-xs text-[#A0B0A0] ${
                  msg.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-md rounded-2xl rounded-tl-sm bg-white px-5 py-4 shadow-sm ring-1 ring-[#D4C5B0]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B4C7B4]"></div>
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B4C7B4] [animation-delay:0.2s]"></div>
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B4C7B4] [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#D4C5B0] bg-[#3D3D3D] p-4 shadow-lg sm:p-5">
        <form onSubmit={onSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full resize-none rounded-3xl border-0 bg-[#F5EFE6] px-5 py-3.5 text-[15px] text-[#3D3D3D] placeholder-[#A0B0A0] focus:outline-none focus:ring-2 focus:ring-[#E07B39]"
              disabled={loading}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E07B39] text-white shadow-md transition-all hover:bg-[#D06B29] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
