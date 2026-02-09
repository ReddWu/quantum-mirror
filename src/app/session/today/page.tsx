import { ChatPane } from "@/components/mirror/chat-pane";
import { GoalList } from "@/components/mirror/goal-list";
import Link from "next/link";

export default function TodaySessionPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {/* Header with navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Today&apos;s Session</h1>
        <div className="flex gap-2">
          <Link
            href="/session/today"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
          >
            Chat
          </Link>
          <Link
            href="/session/today/reframe"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Reframe
          </Link>
          <Link
            href="/session/today/action"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Action
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden w-72 shrink-0 space-y-4 lg:block">
          <GoalList />
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <div className="flex gap-2">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Safety notice: This is a reflection and action planning tool, not medical or psychological therapy. If you have thoughts of self-harm or extreme emotions, please immediately contact your local emergency helpline.</span>
            </div>
          </div>
        </div>

        {/* Chat area - full width on mobile, constrained on desktop */}
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 shadow-lg">
          <ChatPane />
        </div>
      </div>
    </div>
  );
}

