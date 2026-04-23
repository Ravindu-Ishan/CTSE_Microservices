export default function PatchNotesPage() {
  const notes = [
    {
      version: 'v1.4.2',
      date: 'April 2026',
      changes: ['Improved ranked matchmaking algorithm', 'Fixed spectator mode crash on map rotation', 'Performance optimizations for low-end hardware'],
    },
    {
      version: 'v1.4.1',
      date: 'March 2026',
      changes: ['New tactical equipment: Smoke Barrier', 'Rebalanced damage values for long-range weapons', 'UI improvements to the loadout screen'],
    },
    {
      version: 'v1.4.0',
      date: 'February 2026',
      changes: ['Season 4 launch: Shadow Protocol', 'New map: Ironhold Facility', 'New operator: Cipher', 'Seasonal battle pass introduced'],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Patch Notes</h1>
      <p className="text-slate-400 mb-12">Latest updates, balance changes, and bug fixes.</p>
      <div className="space-y-6">
        {notes.map((note) => (
          <div key={note.version} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
              <h2 className="text-lg font-semibold text-white">{note.version}</h2>
              <span className="text-sm text-slate-500">{note.date}</span>
            </div>
            <ul className="space-y-2">
              {note.changes.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
