import { GoalList } from "@/components/mirror/goal-list";
import { ActionPane } from "@/components/mirror/action-pane";
import Link from "next/link";

export default function ActionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Session</h1>
        <div className="flex gap-2">
          <Link
            href="/session/today"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Chat
          </Link>
          <Link
            href="/session/today/reframe"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Reframe
          </Link>
          <Link
            href="/session/today/action"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Action
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <GoalList />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-emerald-900">Action Collapse</h2>
                <p className="mt-1 text-sm text-emerald-700">
                  生成 10-20 分钟的可拍照物理动作，打卡后获得 AI 反馈。
                </p>
              </div>
            </div>
          </div>
          <ActionPane />
        </div>
      </div>
    </div>
  );
}

