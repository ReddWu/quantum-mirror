"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/goals", label: "Goals" },
  { href: "/session/today", label: "Today" },
  { href: "/history", label: "History" },
];

export function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgb(246_244_238/0.92)] backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[11px] font-bold text-[var(--accent)]">
            QM
          </span>
          <span className="font-[family-name:var(--font-serif)] text-xl font-semibold tracking-tight text-[#1f1f1b]">
            Quantum Mirror
          </span>
        </Link>

        {status === "authenticated" && (
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#1f1f1b] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[#1f1f1b]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="ml-1 hidden h-5 w-px bg-[var(--border)] sm:block" />
            <span className="hidden max-w-36 truncate text-sm text-[var(--muted)] sm:inline">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="qm-button-ghost px-3 py-1.5 text-sm"
            >
              Sign Out
            </button>
          </nav>
        )}

        {status === "unauthenticated" && (
          <Link href="/auth/signin" className="qm-button px-4 py-2 text-sm">
            Sign Up / Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
