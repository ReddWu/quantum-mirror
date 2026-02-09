import { GoalList } from "@/components/mirror/goal-list";
import { ReframePane } from "@/components/mirror/reframe-pane";
import Link from "next/link";

export default function ReframePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="qm-kicker">Session</div>
          <h1 className="mt-3 text-4xl text-[#1f1f1b]">Reframe</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Capture your present scene and extract actionable future deltas.</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          <Link href="/session/today" className="qm-tab">
            Chat
          </Link>
          <Link href="/session/today/reframe" className="qm-tab qm-tab-active">
            Reframe
          </Link>
          <Link href="/session/today/action" className="qm-tab">
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
            <strong className="mr-1 text-[#1f1f1b]">Prompt:</strong>
            Use a real, current photo URL. The clearer your context, the more useful the deltas and narration.
          </div>
          <ReframePane />
        </div>
      </section>
    </div>
  );
}
