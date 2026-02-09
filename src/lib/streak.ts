import { differenceInCalendarDays } from "date-fns";

export function computeStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort(
    (a, b) => b.getTime() - a.getTime()
  );
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(sorted[i - 1], sorted[i]);
    if (diff === 1) {
      streak += 1;
    } else if (diff > 1) {
      break;
    }
  }
  return streak;
}

