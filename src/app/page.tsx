"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const featureList = [
  {
    title: "Future-self chat",
    body: "Use one clear daily conversation to pressure-test stories and identify what matters.",
  },
  {
    title: "Reality reframe",
    body: "Upload one real scene and get concrete deltas between current state and intended identity.",
  },
  {
    title: "Action collapse",
    body: "Convert insight into a short physical task you can finish in one sitting and verify with proof.",
  },
];

const quickActions = [
  {
    href: "/session/today",
    title: "Continue chat",
    body: "Pick up today\'s conversation with your future self.",
  },
  {
    href: "/session/today/reframe",
    title: "Run reframe",
    body: "Create visual deltas from your present environment.",
  },
  {
    href: "/session/today/action",
    title: "Complete action",
    body: "Generate or check in your 10-20 minute task.",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todayGoal, setTodayGoal] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/session/today")
      .then((res) => res.json())
      .then((data) => {
        const goalTitle = data?.session?.goal?.title;
        setTodayGoal(typeof goalTitle === "string" ? goalTitle : null);
      })
      .catch(() => setTodayGoal(null));
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          Loading session
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-5xl space-y-14">
        <section className="qm-panel relative overflow-hidden px-7 py-12 sm:px-12 sm:py-16">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[rgb(26_137_23/0.08)]" />
          <div className="relative max-w-3xl space-y-5">
            <div className="qm-kicker">Daily reflection loop</div>
            <h1 className="text-4xl leading-tight text-[#1f1f1b] sm:text-6xl">
              Build the future identity one finished day at a time.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
              Quantum Mirror gives you a focused sequence: narrative clarity, environmental reframe, and one executable action.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => router.push("/auth/signin")} className="qm-button px-6 py-2.5 text-base">
                Sign up with Google
              </button>
              <Link href="#workflow" className="qm-button-ghost px-6 py-2.5 text-base">
                See workflow
              </Link>
            </div>
          </div>
        </section>

        <section id="workflow" className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl text-[#1f1f1b]">How the loop works</h2>
            <span className="text-sm font-semibold text-[var(--muted)]">3 steps</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureList.map((item, index) => (
              <article key={item.title} className="qm-panel p-6">
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-2xl text-[#1f1f1b]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="qm-warning p-5 text-sm leading-relaxed">
          <strong className="mr-2">Safety notice:</strong>
          Quantum Mirror is for reflection and planning, not medical or psychological care. If you face self-harm thoughts or crisis-level emotions, contact local emergency services immediately.
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section className="qm-panel p-7 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <span className="qm-kicker">Today</span>
            <h1 className="text-4xl text-[#1f1f1b]">
              Welcome back, {session?.user?.name || "friend"}
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
              Keep the rhythm: reflect, reframe, then execute one concrete action before the day closes.
            </p>
          </div>
          <div className="qm-subtle min-w-44 p-4 text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Current streak</div>
            <div className="mt-1 text-3xl font-semibold text-[#1f1f1b]">0</div>
            <div className="text-sm text-[var(--muted)]">days</div>
          </div>
        </div>
      </section>

      <section className="qm-panel p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl text-[#1f1f1b]">Today&apos;s focus</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {todayGoal || "No goal selected yet. Choose one before starting the session."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayGoal ? (
              <>
                <Link href="/session/today" className="qm-button">
                  Open session
                </Link>
                <Link href="/goals" className="qm-button-ghost">
                  Change goal
                </Link>
              </>
            ) : (
              <Link href="/goals" className="qm-button">
                Pick a goal
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="qm-panel group flex h-full flex-col justify-between gap-4 p-5 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div>
              <h3 className="text-2xl text-[#1f1f1b]">{action.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{action.body}</p>
            </div>
            <span className="text-sm font-semibold text-[var(--accent)] transition-transform group-hover:translate-x-1">
              Open
            </span>
          </Link>
        ))}
      </section>

      <section className="text-right">
        <Link href="/history" className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)]">
          View full history
        </Link>
      </section>
    </div>
  );
}
