export default function PlayPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎮</div>
        <h1 className="text-3xl font-bold text-white mb-3">Play Axiom</h1>
        <p className="text-slate-400 mb-8">
          The game client is coming soon. Stay tuned for the full release.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
