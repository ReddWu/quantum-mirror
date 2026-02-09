'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
      }),
    });

    setLoading(false);
    setTitle("");
    setDescription("");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="qm-panel p-7">
      <h2 className="text-3xl text-[#1f1f1b]">Create goal</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Keep it specific and behavior-focused so your future-self chat can challenge it clearly.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="qm-label">Title</label>
          <input
            className="qm-input mt-2"
            placeholder="Become more consistent with deep work"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="qm-label">Description</label>
          <textarea
            rows={5}
            className="qm-textarea mt-2"
            placeholder="Define what done looks like, where friction shows up, and your current constraints."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="qm-button w-full py-2.5 text-base">
          {loading ? "Creating..." : "Create goal"}
        </button>
      </div>
    </form>
  );
}
