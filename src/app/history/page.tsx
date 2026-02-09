import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStreak } from "@/lib/streak";

export default async function HistoryPage() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return <div className="qm-warning p-4 text-sm">Please sign in first.</div>;
  }

  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    orderBy: { dateKey: "desc" },
    include: {
      goal: true,
      actionTasks: {
        include: { checkins: true },
      },
    },
  });

  const completedDates = sessions
    .filter((s) => s.actionTasks.some((t) => t.completedAt))
    .map((s) => new Date(s.dateKey));
  const streak = computeStreak(completedDates);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="qm-kicker">Archive</div>
          <h1 className="mt-3 text-5xl text-[#1f1f1b]">History</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Review consistency across completed sessions.</p>
        </div>
        <div className="qm-subtle px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Current streak</div>
          <div className="mt-1 text-2xl font-semibold text-[#1f1f1b]">{streak} days</div>
        </div>
      </header>

      <section className="space-y-3">
        {sessions.length === 0 && <div className="qm-empty p-5 text-sm">No history yet.</div>}

        {sessions.map((s) => {
          const completed = s.actionTasks.some((t) => t.completedAt);

          return (
            <article key={s.id} className="qm-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{s.dateKey}</div>
                  <h2 className="mt-1 text-3xl text-[#1f1f1b]">{s.goal.title}</h2>
                </div>
                <span className={`qm-badge ${completed ? "" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>
                  {completed ? "Completed" : "In progress"}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                <p>Status: {s.status}</p>
                <p>Action tasks: {s.actionTasks.length}</p>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
