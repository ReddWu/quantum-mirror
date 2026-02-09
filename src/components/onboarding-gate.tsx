"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function canBypass(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/auth");
}

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (canBypass(pathname)) return;

    let cancelled = false;

    fetch("/api/questionnaire/status", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: { completed?: boolean } | null) => {
        if (cancelled) return;
        if (!data) return;
        const completed = Boolean(data?.completed);

        if (!completed && pathname !== "/onboarding") {
          router.replace("/onboarding");
          return;
        }
      })
      .catch((error) => {
        console.error("[OnboardingGate] status check failed", error);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router, status]);

  return <>{children}</>;
}
