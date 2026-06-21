export default function SelectableCard({ title, description, helper, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-[22px] border p-5 text-left transition ${
        selected
          ? "border-teal-300/40 bg-teal-400/10 shadow-[0_16px_36px_rgba(20,184,166,0.14)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {helper ? <p className="mt-2 text-sm text-teal-200">{helper}</p> : null}
        </div>
        <span
          className={`mt-1 h-4 w-4 rounded-full border ${
            selected ? "border-teal-300 bg-teal-300" : "border-slate-500"
          }`}
          aria-hidden="true"
        />
      </div>
      {description ? <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p> : null}
    </button>
  );
}
