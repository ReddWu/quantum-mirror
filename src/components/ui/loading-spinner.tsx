export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative h-10 w-10">
        <div className="absolute h-full w-full rounded-full border-4 border-zinc-200"></div>
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    </div>
  );
}

export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" style={{ animationDelay: '150ms' }}></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}
