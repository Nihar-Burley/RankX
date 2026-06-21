import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaChartBar,
  FaChartLine,
  FaChevronDown,
  FaClipboardList,
  FaCog,
  FaLayerGroup,
  FaQuestionCircle,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { logoutUser } from "../services/authService";

const navigationItems = [
  { label: "Admin Dashboard", to: "/admin/dashboard", icon: FaChartBar },
  { label: "Users", to: "/admin/users", icon: FaUsers },
  { label: "Problems", to: "/admin/analytics/problems", icon: FaChartLine },
  { label: "Quizzes", to: "/quizzes", icon: FaClipboardList },
  { label: "Questions", to: "/admin/analytics/questions", icon: FaQuestionCircle },
  { label: "Study Plans", to: "/admin/plans", icon: FaLayerGroup },
  { label: "Analytics", to: "/admin/analytics/quizzes", icon: FaChartLine },
  { label: "KPIs", to: "/admin/analytics/kpis", icon: FaChartBar },
  { label: "Settings", to: "/admin/settings", icon: FaCog },
];

const navLinkBase =
  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/20";

const getNavLinkClass = ({ isActive }) =>
  `${navLinkBase} ${
    isActive
      ? "bg-sky-400/12 text-white ring-1 ring-sky-300/20"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

const readAdminName = () => {
  const role = localStorage.getItem("role");
  return role === "ROLE_ADMIN" ? "Platform Admin" : "Admin Operator";
};

export default function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [adminName] = useState(readAdminName);

  const initials = useMemo(
    () =>
      adminName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(""),
    [adminName]
  );

  const activeNav = useMemo(
    () => navigationItems.find((item) => location.pathname.startsWith(item.to)) || navigationItems[0],
    [location.pathname]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role && !["ROLE_ADMIN", "ADMIN"].includes(role))) {
      logoutUser();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  const handleNavigate = () => {
    setMobileNavOpen(false);
    setProfileMenuOpen(false);
  };

  const renderNavigation = () => (
    <div className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink key={item.to} to={item.to} className={getNavLinkClass} onClick={handleNavigate}>
            <Icon className="text-sm text-slate-500 transition group-hover:text-slate-300" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/78 px-5 py-6 backdrop-blur-xl lg:flex">
          <div className="mb-8">
            <div className="badge-neutral">RankX Admin</div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Management console</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              One place to monitor platform health, manage learning content, and take action quickly.
            </p>
          </div>

          <div>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Main
            </p>
            {renderNavigation()}
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Control lane</p>
              <p className="mt-2 text-sm font-medium text-white">{adminName}</p>
              <p className="mt-1 text-xs text-slate-400">Administrative access</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Prioritize content quality, study plans, and KPI trends first.
              </p>
            </div>

            <button type="button" onClick={handleLogout} className="btn-secondary w-full justify-start">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/76 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className="btn-secondary px-3 lg:hidden"
                  aria-label="Open admin navigation"
                >
                  <FaBars />
                </button>

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Admin / {activeNav.label}
                  </p>
                  <p className="text-sm font-medium text-white">Administrative workflows and management actions</p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/20"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/12 text-sm font-semibold text-sky-200">
                    {initials || "AD"}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block text-sm font-medium text-white">{adminName}</span>
                    <span className="block text-xs text-slate-400">Admin workspace</span>
                  </span>
                  <FaChevronDown className="hidden text-slate-500 sm:block" />
                </button>

                {profileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 rounded-3xl border border-white/10 bg-slate-950/96 p-2 shadow-[0_24px_60px_rgba(2,8,23,0.42)] backdrop-blur-xl"
                  >
                    <NavLink to="/admin/settings" className={getNavLinkClass} role="menuitem" onClick={handleNavigate}>
                      <FaCog className="text-sm text-slate-500" />
                      <span>Settings</span>
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${navLinkBase} w-full text-slate-400 hover:bg-white/5 hover:text-white`}
                      role="menuitem"
                    >
                      <FaSignOutAlt className="text-sm text-slate-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">
            <Outlet context={{ onLogout: handleLogout, adminName }} />
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close admin navigation"
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-xs flex-col border-r border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="badge-neutral">RankX Admin</div>
                <p className="mt-3 text-sm text-slate-400">Navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="btn-ghost"
                aria-label="Close admin navigation"
              >
                <FaTimes />
              </button>
            </div>

            <div className="overflow-y-auto">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Main
              </p>
              {renderNavigation()}
            </div>

            <div className="mt-auto pt-6">
              <button type="button" onClick={handleLogout} className="btn-secondary w-full justify-start">
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
