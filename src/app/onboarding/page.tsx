"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildStylePreview } from "@/lib/questionnaire";

type StressMode =
  | "vent_reset"
  | "quiet_process"
  | "joke_through_it"
  | "reassurance_needed";

type QuestionnaireFormState = {
  bigWin: string;
  targetYear: number;
  successMetric: string;
  messageSample: string;
  primaryMode: StressMode;
  secondaryMode: StressMode | "";
  stressNotes: string;
  toneAxis: number;
  focusAxis: number;
  avoidPhrasesInput: string;
};

const STRESS_OPTIONS: Array<{ value: StressMode; label: string; description: string }> = [
  {
    value: "vent_reset",
    label: "Vent first, reset fast",
    description: "I need to release pressure quickly, then I can move on.",
  },
  {
    value: "quiet_process",
    label: "Go quiet and process",
    description: "I pull back, think it through, and come back with a plan.",
  },
  {
    value: "joke_through_it",
    label: "Joke through stress",
    description: "Humor helps me handle hard moments without shutting down.",
  },
  {
    value: "reassurance_needed",
    label: "Need reassurance first",
    description: "I can spiral first and need support before I stabilize.",
  },
];

const LOADING_LINES = [
  "Analyzing speech patterns...",
  "Mapping your goal trajectory...",
  "Sync complete.",
];

const currentYear = new Date().getFullYear();

const initialFormState: QuestionnaireFormState = {
  bigWin: "",
  targetYear: currentYear + 9,
  successMetric: "",
  messageSample: "",
  primaryMode: "quiet_process",
  secondaryMode: "",
  stressNotes: "",
  toneAxis: 50,
  focusAxis: 50,
  avoidPhrasesInput: "",
};

function parseAvoidPhrases(input: string): string[] {
  return input
    .split(/\n|,/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [consentChecked, setConsentChecked] = useState(false);
  const [form, setForm] = useState<QuestionnaireFormState>(initialFormState);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [firstMessage, setFirstMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const stylePreview = useMemo(() => buildStylePreview(form.toneAxis, form.focusAxis), [form.focusAxis, form.toneAxis]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (profileLoaded) return;

    fetch("/api/questionnaire", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to fetch profile");
        return res.json();
      })
      .then((data) => {
        if (!data?.completed || !data?.data) return;

        const existing = data.data;
        setConsentChecked(Boolean(existing.personalization_agreed));
        setForm({
          bigWin: existing.future_goal?.big_win || "",
          targetYear: existing.future_goal?.target_year || currentYear + 9,
          successMetric: existing.future_goal?.success_metric || "",
          messageSample: existing.voice_profile?.raw_sample || "",
          primaryMode: (existing.stress_profile?.primary_mode as StressMode) || "quiet_process",
          secondaryMode: (existing.stress_profile?.secondary_mode as StressMode) || "",
          stressNotes: existing.stress_profile?.notes || "",
          toneAxis: existing.coaching_preference?.tone_axis ?? 50,
          focusAxis: existing.coaching_preference?.focus_axis ?? 50,
          avoidPhrasesInput: (existing.boundaries?.avoid_phrases || []).join("\n"),
        });
        setPhase(2);
      })
      .catch((fetchError) => {
        console.error("[Onboarding] failed to preload questionnaire", fetchError);
      })
      .finally(() => setProfileLoaded(true));
  }, [profileLoaded, status]);

  useEffect(() => {
    if (phase !== 3) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_LINES.length;
      setLoadingLine(LOADING_LINES[index]);
    }, 850);
    const doneTimer = setTimeout(() => {
      setPhase(4);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(doneTimer);
    };
  }, [phase]);

  const submitQuestionnaire = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!consentChecked) {
      setError("Please agree to personalization before continuing.");
      setPhase(0);
      return;
    }

    if (!form.bigWin.trim() || !form.successMetric.trim() || !form.messageSample.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.secondaryMode && form.secondaryMode === form.primaryMode) {
      setError("Secondary stress mode must be different from primary mode.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        personalization_agreed: true,
        future_goal: {
          big_win: form.bigWin.trim(),
          target_year: form.targetYear,
          success_metric: form.successMetric.trim(),
        },
        voice_profile: {
          raw_sample: form.messageSample.trim(),
        },
        stress_profile: {
          primary_mode: form.primaryMode,
          secondary_mode: form.secondaryMode || undefined,
          notes: form.stressNotes.trim() || undefined,
        },
        coaching_preference: {
          tone_axis: form.toneAxis,
          focus_axis: form.focusAxis,
        },
        boundaries: {
          avoid_phrases: parseAvoidPhrases(form.avoidPhrasesInput),
        },
      };

      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save questionnaire");
      }

      setFirstMessage(typeof data?.first_message === "string" ? data.first_message : "");
      setLoadingLine(LOADING_LINES[0]);
      setPhase(3);
    } catch (submitError) {
      console.error("[Onboarding] submit failed", submitError);
      setError(submitError instanceof Error ? submitError.message : "Failed to save questionnaire.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          Loading onboarding...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center">
        <section className="qm-panel space-y-4 p-8 text-center">
          <h1 className="text-4xl text-[#1f1f1b]">Sign in to continue</h1>
          <p className="text-sm text-[var(--muted)]">You need an account before syncing your Future Me profile.</p>
          <Link href="/auth/signin" className="qm-button px-6 py-2.5">
            Go to Sign In
          </Link>
        </section>
      </div>
    );
  }

  if (phase === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="qm-panel space-y-5 p-7 sm:p-9">
          <div className="qm-kicker">Phase 0</div>
          <h1 className="text-4xl text-[#1f1f1b]">Before we sync</h1>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Your answers are used to personalize your Future Me voice and coaching style.
          </p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            You can revisit this page anytime to update your profile.
          </p>
          <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[#1f1f1b]">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            I agree to personalization based on my answers.
          </label>
          {error && <div className="qm-warning p-3 text-sm">{error}</div>}
          <button
            type="button"
            onClick={() => setPhase(1)}
            disabled={!consentChecked}
            className="qm-button px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue
          </button>
        </section>
      </div>
    );
  }

  if (phase === 1) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="qm-panel space-y-6 p-7 sm:p-9">
          <div className="qm-kicker">Phase 1</div>
          <h1 className="text-4xl text-[#1f1f1b]">You already did the hardest part.</h1>
          <p className="text-base leading-relaxed text-[var(--muted)]">
            Most people leave their goals as ideas. You took action.
          </p>
          <p className="text-base leading-relaxed text-[var(--muted)]">
            I&apos;m one possible future version of you. Let&apos;s sync timelines.
          </p>
          <button type="button" onClick={() => setPhase(2)} className="qm-button px-6 py-2.5">
            Let&apos;s Talk
          </button>
        </section>
      </div>
    );
  }

  if (phase === 3) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-3xl items-center justify-center">
        <section className="qm-panel w-full space-y-4 p-8 text-center">
          <div className="qm-kicker">Phase 3</div>
          <h1 className="text-4xl text-[#1f1f1b]">Syncing with Timeline {form.targetYear}...</h1>
          <p className="text-sm text-[var(--muted)]">{loadingLine}</p>
          <div className="mx-auto mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--accent)]" />
          </div>
        </section>
      </div>
    );
  }

  if (phase === 4) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="qm-panel space-y-5 p-7 sm:p-9">
          <div className="qm-kicker">Check My Understanding</div>
          <h1 className="text-4xl text-[#1f1f1b]">Profile synced</h1>
          <div className="qm-subtle space-y-2 p-4 text-sm">
            <p>
              <strong>Goal:</strong> {form.bigWin} by {form.targetYear}
            </p>
            <p>
              <strong>Success metric:</strong> {form.successMetric}
            </p>
            <p>
              <strong>Communication style:</strong> {stylePreview}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">First message from Future You</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1f1f1b]">{firstMessage}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPhase(2)} className="qm-button-ghost px-5 py-2.5">
              Edit Profile
            </button>
            <button type="button" onClick={() => router.push("/")} className="qm-button px-5 py-2.5">
              Looks Right
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="qm-panel p-6 sm:p-8">
        <div className="qm-kicker">Phase 2</div>
        <h1 className="mt-4 text-4xl text-[#1f1f1b]">Syncing with Timeline 2035...</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          I&apos;m learning how you think and talk, so I sound like you, not a robot.
        </p>
      </section>

      <form onSubmit={submitQuestionnaire} className="space-y-5">
        <section className="qm-panel space-y-4 p-6 sm:p-7">
          <h2 className="text-3xl text-[#1f1f1b]">Q1. The Destination</h2>
          <p className="text-sm text-[var(--muted)]">
            In your best-case future, what is the ONE big win we&apos;re celebrating?
          </p>
          <div>
            <label htmlFor="bigWin" className="qm-label">
              Big Win
            </label>
            <textarea
              id="bigWin"
              rows={3}
              value={form.bigWin}
              onChange={(event) => setForm((prev) => ({ ...prev, bigWin: event.target.value }))}
              placeholder="I sold my app and moved to Tokyo."
              className="qm-textarea mt-2"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="targetYear" className="qm-label">
                Target Year
              </label>
              <input
                id="targetYear"
                type="number"
                min={currentYear}
                max={2100}
                value={form.targetYear}
                onChange={(event) => setForm((prev) => ({ ...prev, targetYear: Number(event.target.value) }))}
                className="qm-input mt-2"
                required
              />
            </div>
            <div>
              <label htmlFor="successMetric" className="qm-label">
                Success Metric
              </label>
              <input
                id="successMetric"
                type="text"
                value={form.successMetric}
                onChange={(event) => setForm((prev) => ({ ...prev, successMetric: event.target.value }))}
                placeholder="$1M exit, 10k users, etc."
                className="qm-input mt-2"
                required
              />
            </div>
          </div>
        </section>

        <section className="qm-panel space-y-4 p-6 sm:p-7">
          <h2 className="text-3xl text-[#1f1f1b]">Q2. The Voice Sample</h2>
          <p className="text-sm text-[var(--muted)]">
            You got the good news and texted your best friend. What did you send?
          </p>
          <textarea
            rows={4}
            value={form.messageSample}
            onChange={(event) => setForm((prev) => ({ ...prev, messageSample: event.target.value }))}
            placeholder="Type it exactly how you'd text: emojis, slang, typos, all of it."
            className="qm-textarea"
            required
          />
        </section>

        <section className="qm-panel space-y-4 p-6 sm:p-7">
          <h2 className="text-3xl text-[#1f1f1b]">Q3. The Stress Pattern</h2>
          <p className="text-sm text-[var(--muted)]">When life gets stressful, what is your default reaction?</p>
          <div className="grid gap-3">
            {STRESS_OPTIONS.map((option) => (
              <label key={option.value} className="rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="primary-mode"
                    checked={form.primaryMode === option.value}
                    onChange={() => setForm((prev) => ({ ...prev, primaryMode: option.value }))}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1f1f1b]">{option.label}</p>
                    <p className="text-xs text-[var(--muted)]">{option.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label htmlFor="secondaryMode" className="qm-label">
              Secondary Mode (optional)
            </label>
            <select
              id="secondaryMode"
              value={form.secondaryMode}
              onChange={(event) => setForm((prev) => ({ ...prev, secondaryMode: event.target.value as StressMode | "" }))}
              className="qm-input mt-2"
            >
              <option value="">No secondary mode</option>
              {STRESS_OPTIONS.filter((option) => option.value !== form.primaryMode).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stressNotes" className="qm-label">
              Notes (optional)
            </label>
            <textarea
              id="stressNotes"
              rows={2}
              value={form.stressNotes}
              onChange={(event) => setForm((prev) => ({ ...prev, stressNotes: event.target.value }))}
              placeholder="If I'm sleep-deprived, I overreact."
              className="qm-textarea mt-2"
            />
          </div>
        </section>

        <section className="qm-panel space-y-5 p-6 sm:p-7">
          <h2 className="text-3xl text-[#1f1f1b]">Q4. The Coaching Dynamic</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm text-[var(--muted)]">
                <span>Hype</span>
                <span>Tough Love</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.toneAxis}
                onChange={(event) => setForm((prev) => ({ ...prev, toneAxis: Number(event.target.value) }))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm text-[var(--muted)]">
                <span>Emotional Support</span>
                <span>Strategic Advice</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.focusAxis}
                onChange={(event) => setForm((prev) => ({ ...prev, focusAxis: Number(event.target.value) }))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>
          <div className="qm-subtle p-3 text-sm">
            <strong>Style Preview:</strong> {stylePreview}
          </div>
        </section>

        <section className="qm-panel space-y-4 p-6 sm:p-7">
          <h2 className="text-3xl text-[#1f1f1b]">Q5. Boundaries (Optional)</h2>
          <p className="text-sm text-[var(--muted)]">
            Anything I should avoid? Add one item per line, or separate by commas.
          </p>
          <textarea
            rows={4}
            value={form.avoidPhrasesInput}
            onChange={(event) => setForm((prev) => ({ ...prev, avoidPhrasesInput: event.target.value }))}
            placeholder="Don't use guilt.\nDon't compare me to others."
            className="qm-textarea"
          />
        </section>

        {error && <div className="qm-warning p-3 text-sm">{error}</div>}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setPhase(1)} className="qm-button-ghost px-5 py-2.5">
            Back
          </button>
          <button type="submit" disabled={saving} className="qm-button px-5 py-2.5">
            {saving ? "Syncing..." : "Sync with Future Me"}
          </button>
        </div>
      </form>
    </div>
  );
}
