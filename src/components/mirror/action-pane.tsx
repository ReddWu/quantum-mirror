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
    return <div className="qm-warning p-4 text-sm">A goal and an active session are required.</div>;
  }

  return (
    <div className="space-y-4">
      {!action && (
        <section className="qm-panel space-y-4 p-6">
          <div>
            <label className="qm-label">Chat summary / future deltas</label>
            <textarea
              rows={5}
              className="qm-textarea mt-2"
              placeholder="Paste key insights from chat or reframe..."
              value={chatSummary}
              onChange={(e) => setChatSummary(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">This context is used to generate a practical task for today.</p>
          </div>

          <button onClick={generate} disabled={loading} className="qm-button w-full py-2.5 text-base">
            {loading ? "Generating..." : "Collapse into action"}
          </button>
        </section>
      )}

      {action && (
        <section className="qm-panel space-y-4 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Today&apos;s action</div>
            <h2 className="mt-1 text-3xl text-[#1f1f1b]">{action.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Estimated time: {action.estimated_minutes} minutes</p>
          </div>

          <div className="qm-subtle p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Steps</div>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-[#1f1f1b]">
              {action.instructions?.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm italic text-[var(--muted)]">
            {action.rationale}
          </p>
        </section>
      )}

      {action && !feedback && (
        <section className="qm-panel space-y-4 p-6">
          <h3 className="text-2xl text-[#1f1f1b]">Check in</h3>

          <div>
            <label className="qm-label">Proof photo URL</label>
            <input
              className="qm-input mt-2"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="qm-label">Reflection (optional)</label>
            <textarea
              rows={4}
              className="qm-textarea mt-2"
              placeholder="How did it feel after completing this action?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>

          <button onClick={checkin} disabled={loading} className="qm-button w-full py-2.5 text-base">
            {loading ? "Submitting..." : "I did it"}
          </button>
        </section>
      )}

      {feedback && (
        <section className="qm-panel space-y-3 p-6">
          <h3 className="text-2xl text-[#1f1f1b]">AI feedback</h3>

          <div className="qm-subtle p-4 text-sm leading-relaxed text-[#1f1f1b]">{feedback.feedback}</div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Sustainment tip</div>
            <p className="text-sm text-[#1f1f1b]">{feedback.one_small_sustainment}</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Tomorrow prompt</div>
            <p className="text-sm text-[#1f1f1b]">{feedback.next_prompt}</p>
          </div>
        </section>
      )}
    </div>
  );
}
