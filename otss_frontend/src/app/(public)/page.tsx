import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Background gradient effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-4 py-24 sm:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            Servers Online
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white mb-6 leading-none">
            AXIO
            <span className="text-blue-400">M</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 font-light mb-4 max-w-2xl mx-auto">
            The world is your arena. Conquer, adapt, dominate.
          </p>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto">
            An immersive tactical universe where every decision shapes the battlefield.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/play"
              className="w-full sm:w-auto px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Play Now
            </Link>
            <Link
              href="/patch-notes"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-lg border border-slate-600 transition-colors"
            >
              Patch Notes
            </Link>
          </div>

          {/* Support CTA */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-500/10 rounded-2xl blur" />
            <div className="relative bg-slate-800/80 border border-slate-700 rounded-2xl px-6 py-8 sm:px-10 sm:py-10 backdrop-blur-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Ran into an issue?
              </h2>
              <p className="text-slate-400 mb-8">
                Our support team is standing by. Reach out now and get back in the game.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Sign In to Support
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-slate-700/60 text-slate-300 font-semibold rounded-lg border border-slate-600 transition-colors text-sm"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative border-t border-slate-700/60 bg-slate-900/40 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: '24/7 Support', desc: 'Our team never sleeps so you can game without worry.' },
            { title: 'Fast Response', desc: 'Average ticket resolution in under 2 hours.' },
            { title: 'Secure & Private', desc: 'Your account and data are protected end-to-end.' },
          ].map((f) => (
            <div key={f.title} className="text-center px-4">
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
