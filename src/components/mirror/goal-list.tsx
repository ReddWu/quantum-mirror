'use client';

import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/useSessionStore";

type Goal = { id: string; title: string; description?: string };

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { goal, setGoal } = useSessionStore();

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => setGoals(Array.isArray(data) ? data : []))
      .catch(() => setGoals([]));
  }, []);

  return (
    <div className="qm-panel p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-3xl text-[#1f1f1b]">Your goals</h2>
        {goal?.id && <span className="qm-badge">Selected</span>}
      </div>

      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="qm-empty p-6 text-center text-sm">No goals yet.</div>
        )}

        {goals.map((g) => {
          const selected = goal?.id === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGoal(g)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                selected
                  ? "border-[#1f1f1b] bg-[#1f1f1b] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[#c8c3b2]"
              }`}
            >
              <p className={`font-semibold ${selected ? "text-white" : "text-[#1f1f1b]"}`}>{g.title}</p>
              {g.description && (
                <p className={`mt-2 text-sm leading-relaxed ${selected ? "text-white/80" : "text-[var(--muted)]"}`}>
                  {g.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
