export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">About Axiom</h1>
      <p className="text-slate-400 mb-12">The studio. The vision. The game.</p>

      <div className="space-y-8 text-slate-300 leading-relaxed">
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Our Story</h2>
          <p>
            Axiom Studios was founded with one goal: build the tactical game that veterans deserved but
            never got. After years in the industry watching promising titles fall short on depth and
            fairness, we set out to create something different.
          </p>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">The Game</h2>
          <p>
            Axiom is a squad-based tactical shooter set in a near-future world where elite operators
            battle for control of critical infrastructure. Every match is a test of coordination,
            adaptability, and precision.
          </p>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Community First</h2>
          <p>
            We believe that every player deserves responsive, respectful support. Our ticketing system
            is designed to get you back in the game as fast as possible — with full transparency at
            every step.
          </p>
        </section>
      </div>
    </div>
  );
}
