"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-semibold text-zinc-900 sm:text-2xl">
            Quantum Mirror
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {status === "authenticated" && (
            <>
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/") && pathname === "/"
                    ? "text-indigo-600"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Home
              </Link>
              <Link
                href="/goals"
                className={`text-sm font-medium transition-colors ${
                  isActive("/goals")
                    ? "text-indigo-600"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Goals
              </Link>
              <Link
                href="/session/today"
                className={`text-sm font-medium transition-colors ${
                  isActive("/session")
                    ? "text-indigo-600"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Today
              </Link>
              <Link
                href="/history"
                className={`text-sm font-medium transition-colors ${
                  isActive("/history")
                    ? "text-indigo-600"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                History
              </Link>
              <div className="flex items-center gap-3 border-l border-zinc-200 pl-4">
                <div className="hidden text-sm text-zinc-600 sm:block">
                  {session.user?.name || session.user?.email}
                </div>
                <button
                  onClick={() => signOut()}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
          {status === "unauthenticated" && (
            <Link
              href="/api/auth/signin"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
