export default function OnboardingCard({
  title,
  description,
  children,
  footer,
  eyebrow = "Activation",
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,31,0.95))] p-6 shadow-[0_24px_60px_rgba(2,8,23,0.35)] sm:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
      </div>

      <div className="space-y-5">{children}</div>

      {footer ? <div className="mt-8 border-t border-white/10 pt-6">{footer}</div> : null}
    </section>
  );
}
