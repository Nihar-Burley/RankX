import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { getMyPreferences, getMyProfile } from "../services/userApi";

const mainNav = [
  { label: "Dashboard", to: "/home", badge: "DB" },
  { label: "Study Plans", to: "/study-plans", badge: "SP" },
  { label: "Practice", to: "/problems", badge: "PR" },
  { label: "Quizzes", to: "/quiz", badge: "QZ" },
  { label: "Progress", to: "/my-progress", badge: "PG" },
  { label: "Analytics", to: "/analytics", badge: "AN" },
];

const accountNav = [
  { label: "Profile", to: "/account", badge: "PF" },
  { label: "Settings", to: "/settings", badge: "ST" },
  { label: "Billing", to: "/billing", badge: "BL" },
  { label: "Help & Support", to: "/support", badge: "HS" },
];

const navLinkBase =
  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/20";

const getNavLinkClass = ({ isActive }) =>
  `${navLinkBase} ${
    isActive
      ? "bg-teal-400/12 text-white ring-1 ring-teal-300/20"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

const routeMeta = [
  { match: (path) => path === "/home", eyebrow: "Dashboard", title: "Your learning command center" },
  { match: (path) => path.startsWith("/study-plans"), eyebrow: "Study Plans", title: "Guided paths and current learning direction" },
  { match: (path) => path.startsWith("/problems"), eyebrow: "Practice", title: "Coding practice and hands-on problem solving" },
  { match: (path) => path.startsWith("/quiz"), eyebrow: "Quizzes", title: "Concept checks and timed quiz practice" },
  { match: (path) => path.startsWith("/my-progress"), eyebrow: "Progress", title: "What you completed and what comes next" },
  { match: (path) => path.startsWith("/analytics"), eyebrow: "Analytics", title: "Performance signals and weak-topic insights" },
  { match: (path) => path.startsWith("/submissions"), eyebrow: "Submissions", title: "Coding history and evaluation details" },
  { match: (path) => path.startsWith("/account"), eyebrow: "Profile", title: "Account details and personal information" },
  { match: (path) => path.startsWith("/settings"), eyebrow: "Settings", title: "Workspace preferences and account controls" },
  { match: (path) => path.startsWith("/billing"), eyebrow: "Billing", title: "Plans, payments, and subscription details" },
  { match: (path) => path.startsWith("/support"), eyebrow: "Support", title: "Help, contact paths, and support guidance" },
  { match: (path) => path.startsWith("/onboarding"), eyebrow: "Onboarding", title: "Set up your personalized learning path" },
];

export default function UserShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const initials = useMemo(() => {
    const source = profile?.displayName || profile?.username || profile?.email || "User";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile]);

  const activeRouteMeta = useMemo(
    () =>
      routeMeta.find((meta) => meta.match(location.pathname)) || {
        eyebrow: "RankX",
        title: "Focused practice and guided progress",
      },
    [location.pathname]
  );

  const breadcrumbLabel = useMemo(() => {
    const match = [...mainNav, ...accountNav].find((item) => location.pathname.startsWith(item.to));
    return match?.label || "RankX";
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadContext = async () => {
      try {
        const [profileData, preferenceData] = await Promise.all([
          getMyProfile(),
          getMyPreferences().catch(() => null),
        ]);

        setProfile(profileData);
        setPreferences(preferenceData);
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login", { replace: true });
          return;
        }

        setProfileError("Profile details are temporarily unavailable.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadContext();
  }, [navigate]);

  useEffect(() => {
    if (loadingProfile || preferences == null) {
      return;
    }

    if (preferences?.onboardingCompleted === false && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (preferences?.onboardingCompleted && location.pathname === "/onboarding") {
      navigate("/home", { replace: true });
    }
  }, [loadingProfile, preferences, location.pathname, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  const handleNavigate = () => {
    setMobileNavOpen(false);
    setProfileMenuOpen(false);
  };

  const renderNavGroup = (items) => (
    <div className="space-y-1">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={getNavLinkClass} onClick={handleNavigate}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-[11px] font-semibold text-slate-400 transition group-hover:text-slate-200">
            {item.badge}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );

  const compactLayout = location.pathname === "/onboarding";

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        {!compactLayout ? (
          <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/78 px-5 py-6 backdrop-blur-xl lg:flex">
            <div className="mb-8">
              <div className="badge-neutral">RankX</div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Learning workspace</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Clear navigation, guided plans, and one obvious next action every time you return.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Main
                </p>
                {renderNavGroup(mainNav)}
              </div>

              <div>
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Account
                </p>
                {renderNavGroup(accountNav)}
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-6">
              <div className="surface-card-soft">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current focus</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {preferences?.goal || "Set your goal during onboarding"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {profile?.email || (loadingProfile ? "Loading profile..." : "Learning account")}
                </p>
              </div>

              <button type="button" onClick={handleLogout} className="btn-secondary w-full justify-start">
                Logout
              </button>
            </div>
          </aside>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/76 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {!compactLayout ? (
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className="btn-secondary px-3 lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    Menu
                  </button>
                ) : null}

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {breadcrumbLabel} / {activeRouteMeta.eyebrow}
                  </p>
                  <p className="text-sm font-medium text-white">{profileError || activeRouteMeta.title}</p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/20"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400/12 text-sm font-semibold text-teal-200">
                    {initials || "U"}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block text-sm font-medium text-white">
                      {profile?.displayName || profile?.username || "RankX User"}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {profile?.role?.replace("ROLE_", "") || "Member"}
                    </span>
                  </span>
                </button>

                {profileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 rounded-3xl border border-white/10 bg-slate-950/96 p-2 shadow-[0_24px_60px_rgba(2,8,23,0.42)] backdrop-blur-xl"
                  >
                    <NavLink to="/account" className={getNavLinkClass} role="menuitem" onClick={handleNavigate}>
                      <span>Profile</span>
                    </NavLink>
                    <NavLink to="/settings" className={getNavLinkClass} role="menuitem" onClick={handleNavigate}>
                      <span>Settings</span>
                    </NavLink>
                    <NavLink to="/billing" className={getNavLinkClass} role="menuitem" onClick={handleNavigate}>
                      <span>Billing</span>
                    </NavLink>
                    <NavLink to="/support" className={getNavLinkClass} role="menuitem" onClick={handleNavigate}>
                      <span>Help & support</span>
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${navLinkBase} w-full text-slate-400 hover:bg-white/5 hover:text-white`}
                      role="menuitem"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className={`flex-1 ${compactLayout ? "px-0 py-0" : "px-4 py-6 sm:px-6"}`}>
            <Outlet
              context={{
                profile,
                preferences,
                loadingProfile,
                profileError,
                onLogout: handleLogout,
              }}
            />
          </main>
        </div>
      </div>

      {!compactLayout && mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-xs flex-col border-r border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="badge-neutral">RankX</div>
                <p className="mt-3 text-sm text-slate-400">Navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="btn-ghost"
                aria-label="Close navigation"
              >
                Close
              </button>
            </div>

            <div className="space-y-8 overflow-y-auto">
              <div>
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Main
                </p>
                {renderNavGroup(mainNav)}
              </div>
              <div>
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Account
                </p>
                {renderNavGroup(accountNav)}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button type="button" onClick={handleLogout} className="btn-secondary w-full justify-start">
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
