export default function StepProgress({ steps, currentStep }) {
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06]">
        <div
          className="h-2 rounded-full bg-teal-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-full px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] ${
              index === currentStep
                ? "bg-teal-400/12 text-teal-100"
                : index < currentStep
                  ? "bg-white/[0.08] text-slate-300"
                  : "bg-white/[0.03] text-slate-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
