export default function AppShell({
  sidebar,
  topbar,
  mobileSidebar,
  compact = false,
  children,
  shellTone = "dark",
}) {
  const pageBackground =
    shellTone === "light"
      ? "bg-[linear-gradient(180deg,#f6f7fb_0%,#f1f3f8_100%)] text-[#111827]"
      : "bg-[linear-gradient(180deg,#0b0d14_0%,#0a0c13_100%)] text-white";

  const mainPadding = compact ? "px-0 py-0" : "px-4 py-5 sm:px-5 lg:px-7";
  const contentWidth = compact ? "" : "mx-auto w-full max-w-[1240px]";

  return (
    <div className={`min-h-screen ${pageBackground}`}>
      <div className="flex min-h-screen">
        {!compact ? sidebar : null}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {!compact ? topbar : null}
          <main className={`flex-1 ${mainPadding}`}>
            <div className={contentWidth}>{children}</div>
          </main>
        </div>
      </div>
      {!compact ? mobileSidebar : null}
    </div>
  );
}
