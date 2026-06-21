export default function Sidebar({ brand, title, description, sections, footer, mobile = false, onClose }) {
  const body = (
    <>
      <div className="mb-8">
        <div className="badge-brand">{brand}</div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>

      <div className="space-y-8 overflow-y-auto scrollbar-subtle">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {section.label}
            </p>
            {section.content}
          </div>
        ))}
      </div>

      {footer ? <div className="mt-auto space-y-3 pt-6">{footer}</div> : null}
    </>
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-40 lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close navigation"
        />
        <div className="absolute inset-y-0 left-0 flex w-full max-w-xs flex-col border-r border-white/10 bg-slate-950/96 p-5 shadow-2xl backdrop-blur-xl">
          {body}
        </div>
      </div>
    );
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950/80 px-5 py-6 backdrop-blur-xl lg:flex">
      {body}
    </aside>
  );
}
