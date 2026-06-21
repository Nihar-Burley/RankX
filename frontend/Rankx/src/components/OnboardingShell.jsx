export default function OnboardingShell({ title, subtitle, progress, children, actions }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/84 p-6 shadow-[0_24px_60px_rgba(2,8,23,0.28)] backdrop-blur-xl sm:p-8">
        <p className="eyebrow">Onboarding</p>
        <div className="mt-4 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{subtitle}</p>
        </div>
        <div className="mt-6">{progress}</div>
      </section>

      {children}

      <div className="sticky bottom-4 z-20 rounded-[24px] border border-white/10 bg-slate-950/92 p-4 shadow-[0_18px_40px_rgba(2,8,23,0.28)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {actions}
        </div>
      </div>
    </div>
  );
}
