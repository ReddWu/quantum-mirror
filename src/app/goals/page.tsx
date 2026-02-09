import { GoalForm } from "@/components/mirror/goal-form";
import { GoalList } from "@/components/mirror/goal-list";

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-light tracking-tight text-[#2B3E5F]">Goals</h1>
        <p className="mt-4 text-lg text-[#6B8CAE]">
          Manage your goals and chat with your future self for each one
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <GoalForm />
        <GoalList />
      </div>
    </div>
  );
}
