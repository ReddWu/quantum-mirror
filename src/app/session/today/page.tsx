import { GoalList } from "@/components/mirror/goal-list";
import { ChatPane } from "@/components/mirror/chat-pane";
import Link from "next/link";

export default function TodaySessionPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="qm-kicker">Session</div>
          <h1 className="mt-3 text-4xl text-[#1f1f1b]">Today</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Run chat, reframe, and action in one focused flow.</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          <Link href="/session/today" className="qm-tab qm-tab-active">
            Chat
          </Link>
          <Link href="/session/today/reframe" className="qm-tab">
            Reframe
          </Link>
          <Link href="/session/today/action" className="qm-tab">
            Action
          </Link>
        </nav>
      </header>

      <section className="grid gap-5 lg:grid-cols-[300px,1fr]">
        <aside className="space-y-4">
          <GoalList />
          <div className="qm-warning p-4 text-xs leading-relaxed">
            This app supports reflection and execution. It is not a substitute for medical or psychological care.
          </div>
        </aside>

        <div className="qm-panel min-h-[620px] overflow-hidden">
          <ChatPane />
        </div>
      </section>
    </div>
  );
}
