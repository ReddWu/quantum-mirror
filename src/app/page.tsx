"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todayGoal, setTodayGoal] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch today's session and streak
      fetch("/api/session/today")
        .then((res) => res.json())
        .then((data) => {
          if (data.session?.goal) {
            setTodayGoal(data.session.goal.title);
          }
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-4xl text-center">
          <div className="space-y-6">
            <div className="inline-block rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
              Powered by Gemini 3
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 md:text-6xl">
              Quantum Mirror
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-600">
              Talk to your future self, reframe reality, collapse into action
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => router.push("/api/auth/signin")}
                className="rounded-full bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
              >
                Get Started
              </button>
              <Link
                href="#how-it-works"
                className="rounded-full border-2 border-zinc-300 px-8 py-3 text-base font-medium text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">How It Works</h2>
            <p className="text-lg text-zinc-600">Three steps to achieve your goals, daily check-in</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900">1. Future-Self Chat</h3>
              <p className="text-zinc-600">
                Talk to your future self who has achieved the goal. Get gentle challenges and narrative rewrites.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900">2. Reality Reframe</h3>
              <p className="text-zinc-600">
                Upload a photo of your reality. AI identifies 3 specific differences in your future version.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900">3. Action Collapse</h3>
              <p className="text-zinc-600">
                Get a 10-20 minute actionable task. Take a photo to check in and receive AI feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Safety Notice */}
        <section className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-3">
              <svg className="h-6 w-6 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="mb-1 font-semibold text-amber-900">Important Notice</h3>
                <p className="text-sm text-amber-800">
                  Quantum Mirror is a reflection and action planning tool, not a medical or psychological therapy service.
                  If you have thoughts of self-harm or extreme emotions, please immediately contact your local emergency helpline or a trusted person.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-zinc-900">
              Welcome back, {session?.user?.name || "friend"}
            </h1>
            <p className="text-lg text-zinc-600">Continue your growth journey</p>
          </div>
          <div className="text-right">
            <div className="mb-1 text-3xl font-bold text-indigo-600">0</div>
            <div className="text-sm text-zinc-600">Day streak</div>
          </div>
        </div>
      </section>

      {/* Today's Goal */}
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Today&apos;s Goal</h2>
        {todayGoal ? (
          <div className="mb-6">
            <p className="text-lg font-medium text-indigo-600">{todayGoal}</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-zinc-600">No goal selected yet</p>
          </div>
        )}
        <div className="flex gap-3">
          {todayGoal ? (
            <>
              <Link
                href="/session/today"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700"
              >
                Start Chat
              </Link>
              <Link
                href="/goals"
                className="rounded-lg border-2 border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50"
              >
                Change Goal
              </Link>
            </>
          ) : (
            <Link
              href="/goals"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700"
            >
              Create Goal
            </Link>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/session/today"
          className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all group-hover:scale-110">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="mb-1 font-semibold text-zinc-900">Future-Self Chat</h3>
          <p className="text-sm text-zinc-600">Talk to your achieved future self</p>
        </Link>
        <Link
          href="/session/today/reframe"
          className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-all group-hover:scale-110">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mb-1 font-semibold text-zinc-900">Reality Reframe</h3>
          <p className="text-sm text-zinc-600">Upload photo, discover differences</p>
        </Link>
        <Link
          href="/session/today/action"
          className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 transition-all group-hover:scale-110">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-1 font-semibold text-zinc-900">Action Check-in</h3>
          <p className="text-sm text-zinc-600">Complete tasks, keep your streak</p>
        </Link>
      </section>

      {/* History Link */}
      <section className="text-center">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-indigo-600 transition-all hover:gap-3"
        >
          <span className="font-medium">View History</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
