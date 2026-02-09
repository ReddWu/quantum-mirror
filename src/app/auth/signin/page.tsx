"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

type ProviderMap = Awaited<ReturnType<typeof getProviders>>;

function SignInContent() {
  const [name, setName] = useState("");
  const [providers, setProviders] = useState<ProviderMap>(null);
  const [loading, setLoading] = useState<"google" | "dev-login" | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    getProviders()
      .then((resolvedProviders) => setProviders(resolvedProviders))
      .catch(() => setProviders(null));
  }, []);

  const googleEnabled = Boolean(providers?.google);
  const devModeEnabled = Boolean(providers?.["dev-login"]);

  const authError = useMemo(() => {
    const error = searchParams.get("error");
    if (!error) return null;

    if (error === "OAuthSignin" || error === "OAuthCallback") {
      return "Google authorization failed. Please try again.";
    }

    if (error === "AccessDenied") {
      return "Sign-in was denied. Please check your Google account access.";
    }

    return "Sign-in failed. Please try again later.";
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setLoading("google");
    await signIn("google", { callbackUrl: "/" });
    setLoading(null);
  };

  const handleDevLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading("dev-login");

    const result = await signIn("dev-login", {
      name: name.trim(),
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.ok) {
      router.push(result.url || "/");
      router.refresh();
      return;
    }

    setLoading(null);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="qm-panel p-8 sm:p-10">
          <div className="qm-kicker">Sign up or sign in</div>
          <h1 className="mt-5 text-4xl leading-tight text-[#1f1f1b] sm:text-5xl">Continue your mirror practice.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            Google sign-up and sign-in are supported. Your account is created automatically on first use.
          </p>
          <div className="mt-8 qm-warning p-4 text-xs leading-relaxed">
            In production, use Google or email sign-in only. Dev login is for local development.
          </div>
        </section>

        <section className="qm-panel p-8">
          <h2 className="text-3xl text-[#1f1f1b]">Sign in</h2>

          {authError && <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{authError}</div>}

          <div className="mt-6 space-y-5">
            {googleEnabled && (
              <button
                type="button"
                disabled={loading !== null}
                onClick={handleGoogleSignIn}
                className="w-full rounded-xl bg-[#1f1f1b] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === "google" ? "Connecting Google..." : "Continue with Google"}
              </button>
            )}

            {devModeEnabled && (
              <>
                <div className="relative text-center text-xs text-[var(--muted)]">
                  <span className="bg-[var(--surface)] px-3">or dev login</span>
                  <span className="absolute left-0 top-1/2 -z-10 h-px w-full bg-[var(--border)]" />
                </div>

                <form onSubmit={handleDevLogin} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="qm-label">
                      Your name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex"
                      className="qm-input mt-2"
                      disabled={loading !== null}
                    />
                  </div>

                  <button type="submit" disabled={loading !== null || !name.trim()} className="qm-button w-full py-2.5 text-base">
                    {loading === "dev-login" ? "Signing in..." : "Continue in Dev Mode"}
                  </button>
                </form>
              </>
            )}

            {!googleEnabled && !devModeEnabled && (
              <div className="qm-warning px-4 py-3 text-sm">
                No sign-in provider detected. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, or enable dev-login.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] max-w-4xl items-center justify-center text-sm text-[var(--muted)]">
          Loading sign-in
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
