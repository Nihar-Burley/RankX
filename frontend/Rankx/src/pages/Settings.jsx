import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Settings() {
  return (
    <div className="app-container space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace preferences"
        description="Keep the settings area visible and usable even before more backend-connected preferences are introduced."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Notifications" value="3 options" detail="Email and product communication controls" tone="cyan" />
          <StatCard label="Default landing" value="Configurable" detail="Choose which area should open first" tone="violet" />
          <StatCard label="Timezone" value="Saved locally" detail="Helpful until full backend preferences exist" tone="emerald" />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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
                  className="h-4 w-4 rounded border-white/15 bg-slate-900 text-sky-400 focus:ring-sky-400"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card>
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

            <Button>Save preferences</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
