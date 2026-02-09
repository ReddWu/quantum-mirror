'use client';

import { useState } from "react";
import { useSessionStore } from "@/stores/useSessionStore";

type ActionTask = {
  id?: string;
  title: string;
  instructions: string[];
  rationale: string;
  estimated_minutes: number;
  requires_photo: boolean;
};

type Feedback = {
  feedback: string;
  one_small_sustainment: string;
  next_prompt: string;
};

export function ActionPane() {
  const { goal, sessionId } = useSessionStore();
  const [chatSummary, setChatSummary] = useState("");
  const [action, setAction] = useState<ActionTask | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [reflection, setReflection] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!goal || !sessionId || !chatSummary) return;
    setLoading(true);
    const res = await fetch("/api/mirror/action/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        goal: { title: goal.title, description: goal.description },
        context: { chat_summary: chatSummary },
      }),
    });
    const data = await res.json();
    setAction(data.action_task);
    setLoading(false);
  };

  const checkin = async () => {
    if (!action?.id || !goal || !photoUrl) return;
    setLoading(true);
    const res = await fetch("/api/mirror/action/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action_task_id: action.id,
        photo_url: photoUrl,
        reflection_text: reflection,
        goal: { title: goal.title, description: goal.description },
      }),
    });
    const data = await res.json();
    setFeedback(data);
    setLoading(false);
  };

  if (!goal || !sessionId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        需要目标与已启动的 session。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!action && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Chat summary / future deltas
            </label>
            <textarea
              rows={4}
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="粘贴聊天摘要或差异点..."
              value={chatSummary}
              onChange={(e) => setChatSummary(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              从对话或重构中获得的关键洞察
            </p>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Collapse into action"}
          </button>
        </div>
      )}

      {action && (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Today&apos;s action
              </div>
            </div>
            <div className="text-lg font-bold text-emerald-900">{action.title}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-emerald-700">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {action.estimated_minutes} mins
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                photo required
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Steps
            </div>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-emerald-900">
              {action.instructions?.map((step, idx) => (
                <li key={idx} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-3 text-xs italic text-emerald-800">
            {action.rationale}
          </div>
        </div>
      )}

      {action && !feedback && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-zinc-800">Check in</div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Upload proof (URL)
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Reflection (optional)
            </label>
            <textarea
              rows={3}
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="完成后的感受..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>
          <button
            onClick={checkin}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "I did it"}
          </button>
        </div>
      )}

      {feedback && (
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-emerald-900">AI feedback</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-4 text-sm text-emerald-900">
            {feedback.feedback}
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              可持续建议
            </div>
            <div className="text-sm text-emerald-800">{feedback.one_small_sustainment}</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              明日提示
            </div>
            <div className="text-sm text-emerald-800">{feedback.next_prompt}</div>
          </div>
        </div>
      )}
    </div>
  );
}

