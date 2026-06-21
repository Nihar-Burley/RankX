import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";
import { logoutUser } from "../services/authService";
import { getMyPreferences, getMyProfile } from "../services/userApi";
import AppShell from "./layout/AppShell";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import Button from "./ui/Button";
import { useToast } from "./ui/useToast";

function NavGlyph({ name, className = "h-4 w-4" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M4.5 12.5 12 5l7.5 7.5" />
          <path d="M6.5 10.5v8h4.5v-5h2v5h4.5v-8" />
        </svg>
      );
    case "problems":
      return (
        <svg {...common}>
          <path d="m9 8-4 4 4 4" />
          <path d="m15 8 4 4-4 4" />
          <path d="m13 6-2 12" />
        </svg>
      );
    case "quizzes":
      return (
        <svg {...common}>
          <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
          <path d="M8 10h3M8 13h6M8 16h3.5" />
          <path d="M15.25 10.2a1.55 1.55 0 1 1 2.2 1.4c-.7.32-1.05.66-1.05 1.45" />
          <path d="M16.4 16h.01" />
        </svg>
      );
    case "study-plans":
      return (
        <svg {...common}>
          <path d="m12 3 2 4 4.5.65-3.25 3.15.8 4.45L12 13.3l-4.05 1.95.8-4.45L5.5 7.65 10 7l2-4Z" />
        </svg>
      );
    case "progress":
      return (
        <svg {...common}>
          <path d="M4.5 19.5h15" />
          <path d="M7.5 16v-3.5" />
          <path d="M12 16V7" />
          <path d="M16.5 16v-6" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="m4.5 15.5 4-4 3 2.5 6-7" />
          <path d="M14.5 7h3.5v3.5" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.3" />
          <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.55 5.45l-1.8 1.8M7.25 16.75l-1.8 1.8M18.55 18.55l-1.8-1.8M7.25 7.25l-1.8-1.8" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M15 17.5H9l-1.2 1.4" />
          <path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 1.5h15Z" />
          <path d="M10.2 19a2 2 0 0 0 3.6 0" />
        </svg>
      );
    default:
      return null;
  }
}

const mainNav = [
  { label: "Dashboard", to: "/home", icon: "dashboard" },
  { label: "Problems", to: "/problems", icon: "problems" },
  { label: "Quizzes", to: "/quiz", icon: "quizzes" },
  { label: "Study Plans", to: "/study-plans", icon: "study-plans" },
];

const secondaryNav = [
  { label: "Progress", to: "/my-progress", icon: "progress" },
  { label: "Analytics", to: "/analytics", icon: "analytics" },
];

const routeMeta = [
  {
    match: (path) => path === "/home",
    title: "Dashboard",
    tone: "dark",
    searchPlaceholder: "Search problems, quizzes...",
  },
  {
    match: (path) => path.startsWith("/problems"),
    title: "Problems",
    tone: "dark",
    searchPlaceholder: "Search problems, quizzes...",
  },
  {
    match: (path) => path.startsWith("/quiz"),
    title: "Quizzes",
    tone: "dark",
    searchPlaceholder: "Search problems, quizzes...",
  },
  {
    match: (path) => path.startsWith("/study-plans"),
    title: "Study Plans",
    tone: "light",
    searchPlaceholder: "Search problems, quizzes...",
  },
  {
    match: (path) => path.startsWith("/my-progress"),
    title: "Progress",
    tone: "dark",
    searchPlaceholder: "Search plans, progress...",
  },
  {
    match: (path) => path.startsWith("/analytics"),
    title: "Analytics",
    tone: "dark",
    searchPlaceholder: "Search reports, topics...",
  },
  {
    match: (path) => path.startsWith("/submissions"),
    title: "Submissions",
    tone: "dark",
    searchPlaceholder: "Search submission history...",
  },
  {
    match: (path) => path.startsWith("/account"),
    title: "Account",
    tone: "dark",
    searchPlaceholder: "Search settings, profile...",
  },
  {
    match: (path) => path.startsWith("/onboarding"),
    title: "Onboarding",
    tone: "dark",
    searchPlaceholder: "",
  },
];

export default function UserShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
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
        title: "RankX",
        tone: "dark",
        searchPlaceholder: "Search RankX...",
      },
    [location.pathname],
  );

  const shellTone = activeRouteMeta.tone;
  const compactLayout = location.pathname === "/onboarding";

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

  useEffect(() => {
    if (!profileError) {
      return;
    }

    showToast({
      title: "Profile details unavailable",
      description: profileError,
      tone: "warning",
    });
  }, [profileError, showToast]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  const handleNavigate = () => {
    setMobileNavOpen(false);
    setProfileMenuOpen(false);
  };

  const navLinkBase =
    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4";
  const getNavLinkClass = ({ isActive }) =>
    cn(
      navLinkBase,
      shellTone === "light"
        ? "focus-visible:ring-[#7c69ff]/18"
        : "focus-visible:ring-[#7c69ff]/18",
      isActive
        ? shellTone === "light"
          ? "bg-white text-[#111827] shadow-[0_12px_28px_rgba(15,23,42,0.08)] before:absolute before:left-0 before:top-2 before:h-7 before:w-[3px] before:rounded-r-full before:bg-[#6f63ff]"
          : "bg-white/[0.04] text-white before:absolute before:left-0 before:top-2 before:h-7 before:w-[3px] before:rounded-r-full before:bg-[#6f63ff]"
        : shellTone === "light"
          ? "text-slate-500 hover:bg-white/70 hover:text-[#111827]"
          : "text-slate-400 hover:bg-white/[0.03] hover:text-white",
    );

  const renderNavGroup = (items) => (
    <div className="space-y-1">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={getNavLinkClass} onClick={handleNavigate}>
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition",
                  isActive
                    ? shellTone === "light"
                      ? "bg-[#f2efff] text-[#6f63ff]"
                      : "bg-[#1d2130] text-[#8e84ff]"
                    : shellTone === "light"
                      ? "text-slate-400"
                      : "text-slate-500",
                )}
              >
                <NavGlyph name={item.icon} />
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );

  const sections = [
    { key: "main", label: "", content: renderNavGroup(mainNav) },
    { key: "secondary", label: "", content: renderNavGroup(secondaryNav) },
  ];

  const sidebarFooter = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-2 py-2",
        shellTone === "light" ? "bg-transparent" : "bg-transparent",
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f63ff] text-xs font-semibold text-white">
        {initials || "U"}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold", shellTone === "light" ? "text-[#111827]" : "text-white")}>
          {profile?.displayName || profile?.username || "RankX User"}
        </p>
        <p className={cn("truncate text-xs", shellTone === "light" ? "text-slate-500" : "text-slate-500")}>
          {profile?.role?.replace("ROLE_", "") || "Learner"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/account")}
          className={cn(
            "text-xs font-medium transition",
            shellTone === "light" ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-white",
          )}
        >
          Account
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "text-xs font-medium transition",
            shellTone === "light" ? "text-slate-400 hover:text-slate-600" : "text-slate-500 hover:text-slate-300",
          )}
        >
          Sign out
        </button>
      </div>
    </div>
  );

  const topbarRight = (
    <div className="relative flex items-center gap-3">
      <span
        className={cn(
          "hidden h-9 w-9 items-center justify-center rounded-xl border sm:inline-flex",
          shellTone === "light"
            ? "border-slate-200 bg-white text-slate-500"
            : "border-white/10 bg-[#171b25] text-slate-500",
        )}
      >
        <NavGlyph name="sun" />
      </span>

      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#6f63ff] text-white">
        <NavGlyph name="bell" />
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-[#6f63ff]">
          2
        </span>
      </span>

      <button
        type="button"
        onClick={() => setProfileMenuOpen((value) => !value)}
        className={cn(
          "flex items-center gap-3 rounded-2xl border px-2.5 py-1.5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7c69ff]/18",
          shellTone === "light"
            ? "border-slate-200 bg-white text-[#111827]"
            : "border-white/10 bg-[#171b25] text-white",
        )}
        aria-expanded={profileMenuOpen}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6f63ff] text-xs font-semibold text-white">
          {initials || "U"}
        </span>
        <span className="hidden text-sm font-semibold sm:inline-flex">
          {profile?.displayName || profile?.username || "Alex"}
        </span>
      </button>

      {profileMenuOpen ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full mt-3 w-56 rounded-3xl border p-2 shadow-[0_24px_60px_rgba(2,8,23,0.24)]",
            shellTone === "light"
              ? "border-slate-200 bg-white"
              : "border-white/10 bg-[#121722]",
          )}
        >
          <NavLink
            to="/account"
            className={cn(
              navLinkBase,
              shellTone === "light" ? "text-slate-600 hover:bg-slate-50 hover:text-[#111827]" : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
            )}
            role="menuitem"
            onClick={handleNavigate}
          >
            Profile
          </NavLink>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              navLinkBase,
              "w-full justify-start",
              shellTone === "light" ? "text-slate-600 hover:bg-slate-50 hover:text-[#111827]" : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
            )}
            onClick={handleLogout}
            role="menuitem"
          >
            Logout
          </Button>
        </div>
      ) : null}
    </div>
  );

  return (
    <AppShell
      compact={compactLayout}
      shellTone={shellTone}
      sidebar={
        !compactLayout ? (
          <Sidebar brand="RankX" sections={sections} footer={sidebarFooter} tone={shellTone} />
        ) : null
      }
      topbar={
        !compactLayout ? (
          <Topbar
            menuButton={
              <Button
                type="button"
                variant="secondary"
                className="px-3 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                Menu
              </Button>
            }
            title={profileError || activeRouteMeta.title}
            rightContent={topbarRight}
            searchPlaceholder={activeRouteMeta.searchPlaceholder}
            tone={shellTone}
          />
        ) : null
      }
      mobileSidebar={
        !compactLayout && mobileNavOpen ? (
          <Sidebar
            brand="RankX"
            sections={sections}
            footer={sidebarFooter}
            mobile
            onClose={() => setMobileNavOpen(false)}
            tone={shellTone}
          />
        ) : null
      }
    >
      <Outlet
        context={{
          profile,
          preferences,
          loadingProfile,
          profileError,
          onLogout: handleLogout,
          shellTone,
        }}
      />
    </AppShell>
  );
}
