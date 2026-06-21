export default function Settings() {
  return (
    <div className="app-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Workspace preferences
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Keep the settings area visible and usable even before more backend-connected
          preferences are introduced.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card">
          <h2 className="section-title">Notifications</h2>
          <div className="mt-6 space-y-4">
            {[
              "Email updates for quiz results",
              "Submission status alerts",
              "Product announcements and release notes",
            ].map((item, index) => (
              <label
                key={item}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm text-slate-200">{item}</span>
                <input
                  type="checkbox"
                  defaultChecked={index === 0}
                  className="h-4 w-4 rounded border-white/15 bg-slate-900 text-teal-400 focus:ring-teal-400"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <h2 className="section-title">Experience</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="timezone" className="field-label">
                Timezone
              </label>
              <select id="timezone" className="input-base">
                <option>Asia/Calcutta</option>
                <option>UTC</option>
                <option>America/New_York</option>
              </select>
            </div>

            <div>
              <label htmlFor="start-page" className="field-label">
                Default landing area
              </label>
              <select id="start-page" className="input-base">
                <option>Dashboard</option>
                <option>Coding Practice</option>
                <option>Quiz Center</option>
              </select>
            </div>

            <button className="btn-primary">Save preferences</button>
          </div>
        </section>
      </div>
    </div>
  );
}
