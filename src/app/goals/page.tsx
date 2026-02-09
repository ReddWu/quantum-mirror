import { GoalForm } from "@/components/mirror/goal-form";
import { GoalList } from "@/components/mirror/goal-list";

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="space-y-3">
        <div className="qm-kicker">Goal library</div>
        <h1 className="text-5xl text-[#1f1f1b]">Goals</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
          Create clear goal narratives and select one as the anchor for your daily mirror session.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <GoalForm />
        <GoalList />
      </section>
    </div>
  );
}
