export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/50 shadow-[0_28px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.22),_transparent_35%),linear-gradient(180deg,_rgba(10,22,39,0.98),_rgba(7,15,27,0.98))] p-10 text-slate-50 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="badge-neutral mb-6">RankX Workspace</div>
            <h1 className="max-w-md text-4xl font-semibold tracking-tight xl:text-5xl">
              Sharpen interview skills in a workspace that feels built for focus.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Practice coding, review submissions, and build momentum with a
              clean learning environment designed for repeat sessions.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Structured coding problems and quiz practice",
              "Clear progress tracking across every attempt",
              "Fast, distraction-light flows for repeat sessions",
            ].map((item) => (
              <div key={item} className="surface-card-soft flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-400/12 text-teal-300">
                  ✓
                </span>
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="eyebrow">Account Access</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>
            </div>

            <div className="surface-card">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
