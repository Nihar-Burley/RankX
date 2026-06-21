export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/50 shadow-[0_28px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_32%),linear-gradient(180deg,_rgba(9,18,31,0.98),_rgba(6,12,22,0.98))] p-10 text-slate-50 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="badge-neutral mb-6">RankX Admin</div>
            <h1 className="max-w-md text-4xl font-semibold tracking-tight xl:text-5xl">
              Operational control that feels clean, fast, and dependable.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Manage quizzes, questions, and platform content with a sharper
              control surface designed for trust and day-to-day efficiency.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Consistent moderation and content management",
              "Quick access to quiz workflows and publishing controls",
              "Production-style forms and data views for daily operations",
            ].map((item) => (
              <div key={item} className="surface-card-soft flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-400/12 text-sky-300">
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
              <p className="eyebrow">Admin Access</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>
            </div>

            <div className="surface-card">
              {children}
              <p className="mt-6 text-center text-xs text-slate-500">
                Secure admin workspace for authorized operators only.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
