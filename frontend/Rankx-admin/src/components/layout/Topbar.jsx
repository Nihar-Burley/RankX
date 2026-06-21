export default function Topbar({ menuButton, eyebrow, title, rightContent }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/76 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {menuButton}
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
            <p className="text-sm font-medium text-white">{title}</p>
          </div>
        </div>
        {rightContent}
      </div>
    </header>
  );
}
