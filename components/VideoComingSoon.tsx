export function VideoComingSoon() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur md:p-8">
      <div className="rounded-2xl border border-dashed border-white/15 bg-black/25 p-8">
        <p className="inline-flex rounded-full border border-lemon/30 bg-lemon/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-lemon">
          Beta next
        </p>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-white">Video analysis is queued up.</h2>
        <p className="mt-3 max-w-xl leading-7 text-slate-300">
          The next version will score captions, on-screen text, audio transcripts, and key frames together.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Frames", "Audio", "Caption"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
