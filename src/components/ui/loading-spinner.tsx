export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative h-10 w-10">
        <div className="absolute h-full w-full rounded-full border-4 border-[var(--border)]" />
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    </div>
  );
}

export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "0ms" }} />
      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "150ms" }} />
      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
