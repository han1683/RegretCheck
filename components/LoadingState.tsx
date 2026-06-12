export function LoadingState() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-mint" />
        <div>
          <p className="font-semibold text-white">Reading the room...</p>
          <p className="text-sm text-smoke">Checking tone, visual context, privacy leaks, and brand risk.</p>
        </div>
      </div>
    </div>
  );
}
