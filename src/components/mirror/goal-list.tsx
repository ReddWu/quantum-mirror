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
      .then((data) => setGoals(data || []))
      .catch(() => setGoals([]));
  }, []);

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-light text-[#2B3E5F]">Your Goals</h2>
      </div>
      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-[#E8E5E0] bg-[#F5F3F0] p-8 text-center">
            <p className="text-sm text-[#6B8CAE]">No goals yet</p>
          </div>
        )}
        {goals.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g)}
            className={`group w-full rounded-2xl border-2 px-5 py-4 text-left transition-all ${
              goal?.id === g.id
                ? "border-[#2B3E5F] bg-[#2B3E5F] shadow-sm"
                : "border-[#E8E5E0] bg-white hover:border-[#6B8CAE]"
            }`}
          >
            <div className={`font-medium ${goal?.id === g.id ? "text-white" : "text-[#2B3E5F]"}`}>
              {g.title}
            </div>
            {g.description && (
              <div className={`mt-2 text-sm ${goal?.id === g.id ? "text-white/80" : "text-[#6B8CAE]"}`}>
                {g.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
