'use client';

import { useState } from "react";
import { useSessionStore } from "@/stores/useSessionStore";

type ReframeResponse = {
  future_deltas: { id: string; type: string; text: string }[];
  narration: string;
  action_seed?: { hint?: string };
};

export function ReframePane() {
  const { goal, sessionId } = useSessionStore();
  const [imageUrl, setImageUrl] = useState("");
  const [context, setContext] = useState("");
  const [resp, setResp] = useState<ReframeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !sessionId || !imageUrl) return;
    setLoading(true);
    const res = await fetch("/api/mirror/reframe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        goal: { title: goal.title, description: goal.description },
        image_url: imageUrl,
        user_context_text: context,
      }),
    });
    const data = await res.json();
    setResp(data);
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
      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="text-sm font-medium text-zinc-700">Image URL</label>
          <input
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            上传你的现实场景照片 URL（桌面、房间、工作空间等）
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">
            Context (optional)
          </label>
          <textarea
            rows={2}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
            placeholder="这是我的桌面，总是很乱..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Mirror Notes"}
        </button>
      </form>

      {resp && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <div className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                Future deltas
              </div>
            </div>
            <ul className="space-y-2.5">
              {resp.future_deltas?.map((d, idx) => (
                <li key={d.id} className="rounded-lg border border-purple-100 bg-purple-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium uppercase text-purple-700">{d.type}</span>
                  </div>
                  <div className="pl-7 text-sm text-purple-900">{d.text}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Narration
              </div>
            </div>
            <p className="text-sm leading-relaxed text-indigo-900">{resp.narration}</p>
          </div>
        </div>
      )}
    </div>
  );
}

