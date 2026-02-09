import { ActionPane } from "@/components/mirror/action-pane";
import { GoalList } from "@/components/mirror/goal-list";
import Link from "next/link";

export default function ActionPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="qm-kicker">Session</div>
          <h1 className="mt-3 text-4xl text-[#1f1f1b]">Action</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Turn narrative momentum into one physically verifiable result.</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          <Link href="/session/today" className="qm-tab">
            Chat
          </Link>
          <Link href="/session/today/reframe" className="qm-tab">
            Reframe
          </Link>
          <Link href="/session/today/action" className="qm-tab qm-tab-active">
            Action
          </Link>
        </nav>
      </header>

      <section className="grid gap-5 lg:grid-cols-[300px,1fr]">
        <aside>
          <GoalList />
        </aside>

        <div className="space-y-4">
          <div className="qm-subtle p-5 text-sm leading-relaxed text-[var(--muted)]">
            <strong className="mr-1 text-[#1f1f1b]">Action rule:</strong>
            Keep scope small enough to finish in one sitting, then provide proof and reflection.
          </div>
          <ActionPane />
        </div>
      </section>
    </div>
  );
}
