export default function Footer() {
  return (
    <footer className="border-t border-slate-700/60 bg-slate-900/40 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          &copy; {new Date().getFullYear()}{' '}
          <span className="text-slate-400 font-medium">Axiom Studios</span>. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="/auth/login" className="hover:text-slate-300 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
