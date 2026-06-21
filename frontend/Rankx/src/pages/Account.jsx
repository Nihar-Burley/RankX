import { useOutletContext } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

export default function Account() {
  const { profile, loadingProfile, profileError } = useOutletContext();

  return (
    <div className="app-container space-y-6">
      <PageHeader
        eyebrow="My Account"
        title="Profile and membership"
        description="Review the account details currently available in your RankX workspace and understand how your current access is set up."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Profile status" value={profile ? "Ready" : "Pending"} detail="Core account information loaded from the current API" tone="cyan" />
          <StatCard label="Workspace role" value={(profile?.role || "ROLE_USER").replace("ROLE_", "")} detail="Access level active for this account" tone="violet" />
          <StatCard label="Contact email" value={profile?.email || "Unavailable"} detail="Shown only when the current profile response includes it" tone="emerald" />
        </div>
      </PageHeader>

      {loadingProfile ? (
        <LoadingState title="Loading account details" description="Preparing your profile and current workspace access details." />
      ) : profileError ? (
        <ErrorState title="Account details unavailable" message={profileError} />
      ) : !profile ? (
        <EmptyState title="No profile details available yet" description="Your account exists, but the current API response did not include any profile fields to display." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <h2 className="section-title">Profile details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card variant="soft">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Display name</p>
                <p className="mt-3 text-base font-semibold text-white">
                  {profile?.displayName || profile?.username || "RankX User"}
                </p>
              </Card>
              <Card variant="soft">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
                <div className="mt-3">
                  <Badge tone="brand">{(profile?.role || "ROLE_USER").replace("ROLE_", "")}</Badge>
                </div>
              </Card>
              <Card variant="soft" className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                <p className="mt-3 text-base font-semibold text-white">
                  {profile?.email || "Not available from the current API response"}
                </p>
              </Card>
            </div>
          </Card>

          <Card>
            <h2 className="section-title">Workspace access</h2>
            <div className="mt-6 space-y-4">
              {[
                "Your sign-in state is managed through the existing token-based auth flow.",
                "Navigation, billing, and support areas are now available directly from the dashboard shell.",
                "This page can later be connected to editable profile APIs when they exist.",
              ].map((item) => (
                <Card key={item} variant="soft">
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
