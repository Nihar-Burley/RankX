export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-[#060d18] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-teal-300/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
              RankX
            </span>
            <span className="hidden text-sm text-slate-400 sm:inline">
              Practice, assess, and improve with confidence
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#practice" className="hover:text-white">
              Practice
            </a>
            <a href="#paths" className="hover:text-white">
              Paths
            </a>
          </div>

          <button className="btn-primary">Get started</button>
        </div>
      </nav>

      <section className="relative px-5 py-20 sm:px-6 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.18),_transparent_28%),radial-gradient(circle_at_85%_10%,_rgba(124,156,255,0.12),_transparent_22%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="badge-neutral">Modern interview prep workspace</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Sharper practice for coding rounds, quizzes, and daily skill growth.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              RankX combines problem solving, quiz practice, and submission review
              into one focused environment that feels fast, premium, and built for
              repeat use.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary px-6 py-3.5">Start practicing free</button>
              <button className="btn-secondary px-6 py-3.5">Explore features</button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
              <span>Structured problem practice</span>
              <span>Quiz assessments</span>
              <span>Progress visibility</span>
            </div>
          </div>

          <div className="surface-card overflow-hidden rounded-[32px] p-0">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="surface-card-soft">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">This week</p>
                <p className="mt-3 text-3xl font-semibold text-white">24</p>
                <p className="mt-2 text-sm text-slate-400">Problems attempted</p>
              </div>
              <div className="surface-card-soft">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Accuracy</p>
                <p className="mt-3 text-3xl font-semibold text-white">89%</p>
                <p className="mt-2 text-sm text-slate-400">Across recent quizzes</p>
              </div>
              <div className="surface-card-soft sm:col-span-2">
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-6 text-emerald-300">
{`$ rankx practice arrays
Session started
Running sample tests...
Passed 6/6 sample cases
Ready to submit`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-slate-950/50 px-5 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["Focused dashboard", "See coding and quiz progress together in one clean view."],
            ["LeetCode-style workspace", "Read, code, run, and submit without leaving context."],
            ["Admin-friendly operations", "Manage quizzes and content with consistent workflows."],
          ].map(([title, copy]) => (
            <div key={title} className="surface-card">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="practice" className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Practice loops designed for momentum
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "Daily coding sets",
            "Timed quiz sessions",
            "Submission review and iteration",
          ].map((item) => (
            <div key={item} className="surface-card">
              <p className="badge-neutral">Workflow</p>
              <h3 className="mt-4 text-xl font-semibold text-white">{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="paths" className="border-t border-white/10 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-slate-950/60 px-6 py-10 shadow-[0_24px_60px_rgba(2,8,23,0.4)] sm:px-10">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A calmer, more trustworthy way to learn by doing
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            RankX keeps the flows simple while making the experience feel more
            polished, responsive, and production-ready across devices.
          </p>
          <button className="btn-primary mt-8 px-6 py-3.5">Create free account</button>
        </div>
      </section>
    </div>
  );
}
