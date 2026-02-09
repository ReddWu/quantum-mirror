import { GoalList } from "@/components/mirror/goal-list";
import { ReframePane } from "@/components/mirror/reframe-pane";
import Link from "next/link";

export default function ReframePage() {
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
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Reframe
          </Link>
          <Link
            href="/session/today/action"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
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
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-purple-900">Reality Anchor</h2>
                <p className="mt-1 text-sm text-purple-700">
                  上传现实场景照片，AI 将分析并生成 3 个未来差异点与旁白。
                </p>
              </div>
            </div>
          </div>
          <ReframePane />
        </div>
      </div>
    </div>
  );
}

