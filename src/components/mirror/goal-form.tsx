'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GoalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setLoading(false);
    setTitle("");
    setDescription("");
    router.refresh();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-white p-8 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-xl font-light text-[#2B3E5F]">Create New Goal</h3>
      </div>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#6B8CAE]">Title</label>
          <input
            className="w-full rounded-2xl border-2 border-[#E8E5E0] bg-[#F5F3F0] px-5 py-3 text-[#2B3E5F] placeholder-[#6B8CAE]/50 transition-all focus:border-[#6B8CAE] focus:outline-none"
            placeholder="e.g., Become more disciplined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#6B8CAE]">Description</label>
          <textarea
            rows={4}
            className="w-full rounded-2xl border-2 border-[#E8E5E0] bg-[#F5F3F0] px-5 py-3 text-[#2B3E5F] placeholder-[#6B8CAE]/50 transition-all focus:border-[#6B8CAE] focus:outline-none"
            placeholder="Describe your goal in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2B3E5F] py-3 text-sm font-medium text-white transition-all hover:bg-[#1f2d45] hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Goal"}
        </button>
      </div>
    </form>
  );
}
