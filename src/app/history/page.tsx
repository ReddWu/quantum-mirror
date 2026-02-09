import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStreak } from "@/lib/streak";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        请先登录。
      </div>
    );
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <div className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800">
          Streak: {streak} days
        </div>
      </div>
      <div className="space-y-3">
        {sessions.length === 0 && (
          <div className="text-sm text-zinc-600">暂无记录。</div>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-base font-semibold">{s.dateKey}</div>
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                {s.goal.title}
              </div>
              <div className="text-xs text-zinc-500">
                Status: {s.status} · Actions: {s.actionTasks.length}
              </div>
              {s.actionTasks.some((t) => t.completedAt) && (
                <span className="text-xs text-emerald-600">Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

