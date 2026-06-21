export default function AppShell({ sidebar, topbar, mobileSidebar, children }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        {sidebar}
        <div className="flex min-h-screen flex-1 flex-col">
          {topbar}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
      {mobileSidebar}
    </div>
  );
}
