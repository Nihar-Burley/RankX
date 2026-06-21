import { useOutletContext } from "react-router-dom";

export default function Account() {
  const { profile, loadingProfile, profileError } = useOutletContext();

  return (
    <div className="app-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">My Account</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Profile and membership
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Review the account details currently available in your RankX workspace.
        </p>
      </header>

      {loadingProfile ? (
        <div className="surface-card animate-pulse">
          <div className="h-6 w-1/3 rounded-full bg-white/8" />
          <div className="mt-4 h-4 w-1/2 rounded-full bg-white/8" />
          <div className="mt-2 h-4 w-2/3 rounded-full bg-white/8" />
        </div>
      ) : profileError ? (
        <div
          role="alert"
          className="surface-card rounded-[28px] border-amber-500/30 bg-amber-500/10 text-amber-100"
        >
          {profileError}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-card">
            <h2 className="section-title">Profile details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="surface-card-soft">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Display name</p>
                <p className="mt-3 text-base font-semibold text-white">
                  {profile?.displayName || profile?.username || "RankX User"}
                </p>
              </div>
              <div className="surface-card-soft">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
                <p className="mt-3 text-base font-semibold text-white">
                  {(profile?.role || "ROLE_USER").replace("ROLE_", "")}
                </p>
              </div>
              <div className="surface-card-soft sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                <p className="mt-3 text-base font-semibold text-white">
                  {profile?.email || "Not available from the current API response"}
                </p>
              </div>
            </div>
          </section>

          <section className="surface-card">
            <h2 className="section-title">Workspace access</h2>
            <div className="mt-6 space-y-4">
              {[
                "Your sign-in state is managed through the existing token-based auth flow.",
                "Navigation, billing, and support areas are now available directly from the dashboard shell.",
                "This page can later be connected to editable profile APIs when they exist.",
              ].map((item) => (
                <div key={item} className="surface-card-soft">
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
