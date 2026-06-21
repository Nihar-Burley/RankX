function BrandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 19V7.8c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2V19" />
      <path d="M3.5 19.5h17" />
      <path d="M8.5 19V10.5h7V19" />
      <path d="M9 9h.01M12 9h.01M15 9h.01" />
    </svg>
  );
}

export default function Sidebar({
  brand,
  sections,
  footer,
  mobile = false,
  onClose,
  tone = "dark",
}) {
  const panelClass =
    tone === "light"
      ? "border-slate-200/90 bg-[#fbfbfd]/96 text-[#111827]"
      : "border-white/8 bg-[#0f1219] text-white";
  const dividerClass = tone === "light" ? "border-slate-200/90" : "border-white/8";
  const brandIconClass =
    tone === "light"
      ? "border border-slate-200 bg-white text-[#6b5cff] shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
      : "bg-[#6f63ff] text-white";
  const brandTextClass = tone === "light" ? "text-[#111827]" : "text-white";

  const body = (
    <>
      <div className={`flex items-center justify-between border-b px-4 py-4 ${dividerClass}`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${brandIconClass}`}>
            <BrandIcon />
          </span>
          <span className={`text-sm font-semibold ${brandTextClass}`}>{brand}</span>
        </div>
        {mobile && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={tone === "light" ? "text-slate-500" : "text-slate-400"}
            aria-label="Close navigation menu"
          >
            x
          </button>
        ) : (
          <span className={tone === "light" ? "text-slate-400" : "text-slate-500"}>&lt;</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <div className="space-y-6 overflow-y-auto scrollbar-subtle">
          {sections.map((section, index) => (
            <div key={section.key || section.label || `sidebar-section-${index}`}>
              {section.label ? (
                <p
                  className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    tone === "light" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {section.label}
                </p>
              ) : null}
              {section.content}
            </div>
          ))}
        </div>
        {footer ? <div className={`mt-auto border-t px-2 pt-4 ${dividerClass}`}>{footer}</div> : null}
      </div>
    </>
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-40 lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
        <div className={`absolute inset-y-0 left-0 flex w-full max-w-[280px] flex-col border-r shadow-2xl ${panelClass}`}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <aside className={`sticky top-0 hidden h-screen w-[190px] flex-col border-r lg:flex ${panelClass}`}>
      {body}
    </aside>
  );
}
