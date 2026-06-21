function SearchIcon() {
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
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function Topbar({
  menuButton,
  title,
  rightContent,
  searchPlaceholder = "Search problems, quizzes...",
  tone = "dark",
}) {
  const shellClass =
    tone === "light"
      ? "border-slate-200/90 bg-[#fbfbfd]/94 text-[#111827]"
      : "border-white/8 bg-[#0f1219]/94 text-white";
  const searchClass =
    tone === "light"
      ? "border-slate-200 bg-[#f5f6fb] text-slate-500"
      : "border-white/8 bg-[#171b25] text-slate-500";

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${shellClass}`}>
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-4 px-4 py-3 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          {menuButton}
          <p className="truncate text-sm font-semibold">{title}</p>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className={`flex w-full max-w-[310px] items-center gap-3 rounded-2xl border px-4 py-2.5 ${searchClass}`}>
            <SearchIcon />
            <span className="text-sm">{searchPlaceholder}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center">{rightContent}</div>
      </div>
    </header>
  );
}
