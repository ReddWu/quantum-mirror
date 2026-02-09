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
    return <div className="qm-warning p-4 text-sm">A goal and an active session are required.</div>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="qm-panel space-y-4 p-6">
        <div>
          <label className="qm-label">Image URL</label>
          <input
            className="qm-input mt-2"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">Use a clear photo of your current environment (desk, room, workspace).</p>
        </div>

        <div>
          <label className="qm-label">Context (optional)</label>
          <textarea
            rows={3}
            className="qm-textarea mt-2"
            placeholder="This is my desk after work and it is usually cluttered..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="qm-button w-full py-2.5 text-base">
          {loading ? "Generating..." : "Generate mirror notes"}
        </button>
      </form>

      {resp && (
        <section className="qm-panel space-y-5 p-6">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Future deltas</div>
            <ul className="space-y-2.5">
              {resp.future_deltas?.map((d, idx) => (
                <li key={d.id} className="qm-subtle p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1f1f1b] text-xs font-semibold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{d.type}</span>
                  </div>
                  <p className="pl-7 text-sm leading-relaxed text-[#1f1f1b]">{d.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Narration</div>
            <p className="text-sm leading-relaxed text-[#1f1f1b]">{resp.narration}</p>
          </div>
        </section>
      )}
    </div>
  );
}
