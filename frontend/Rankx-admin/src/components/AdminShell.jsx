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
} from "react-icons/fa";
import { cn } from "../lib/cn";
import { logoutUser } from "../services/authService";
import AppShell from "./layout/AppShell";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import Button from "./ui/Button";
import Card from "./ui/Card";

const navigationItems = [
  {
    label: "Operations",
    items: [
      { label: "Admin Dashboard", to: "/admin/dashboard", icon: FaChartBar },
      { label: "Study Plans", to: "/admin/plans", icon: FaLayerGroup },
      { label: "Quizzes", to: "/quizzes", icon: FaClipboardList },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Problems", to: "/admin/analytics/problems", icon: FaChartLine },
      { label: "Questions", to: "/admin/analytics/questions", icon: FaQuestionCircle },
      { label: "Quiz Analytics", to: "/admin/analytics/quizzes", icon: FaChartLine },
      { label: "KPIs", to: "/admin/analytics/kpis", icon: FaChartBar },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Settings", to: "/admin/settings", icon: FaCog },
    ],
  },
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
    () =>
      navigationItems
        .flatMap((section) => section.items)
        .find((item) => location.pathname.startsWith(item.to)) ||
      navigationItems[0].items[0],
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

  const sections = navigationItems.map((section) => ({
    label: section.label,
    content: (
      <div className="space-y-1">
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass} onClick={handleNavigate}>
              <Icon className="text-sm text-slate-500 transition group-hover:text-slate-300" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    ),
  }));

  const sidebarFooter = (
    <>
      <Card variant="soft">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Control lane</p>
        <p className="mt-2 text-sm font-medium text-white">{adminName}</p>
        <p className="mt-1 text-xs text-slate-400">Administrative access</p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Prioritize learner health, content quality, and KPI trends before lower-signal admin work.
        </p>
      </Card>

      <Button type="button" variant="secondary" className="w-full justify-start" onClick={handleLogout}>
        <FaSignOutAlt />
        Logout
      </Button>
    </>
  );

  const topbarRight = (
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
          <Button
            type="button"
            variant="ghost"
            className={cn(navLinkBase, "w-full text-slate-400 hover:bg-white/5 hover:text-white")}
            onClick={handleLogout}
            role="menuitem"
          >
            <FaSignOutAlt className="text-sm text-slate-500" />
            <span>Logout</span>
          </Button>
        </div>
      ) : null}
    </div>
  );

  return (
    <AppShell
      sidebar={
        <Sidebar
          brand="RankX Admin"
          title="Management console"
          description="One place to monitor platform health, manage learning content, and take action quickly."
          sections={sections}
          footer={sidebarFooter}
        />
      }
      topbar={
        <Topbar
          menuButton={
            <Button
              type="button"
              variant="secondary"
              className="px-3 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin navigation"
            >
              <FaBars />
            </Button>
          }
          eyebrow={`Admin / ${activeNav.label}`}
          title="Operations, content management, and platform insights"
          rightContent={topbarRight}
        />
      }
      mobileSidebar={
        mobileNavOpen ? (
          <Sidebar
            brand="RankX Admin"
            title="Navigation"
            description="Choose the next admin workflow."
            sections={sections}
            footer={
              <Button type="button" variant="secondary" className="w-full justify-start" onClick={handleLogout}>
                <FaSignOutAlt />
                Logout
              </Button>
            }
            mobile
            onClose={() => setMobileNavOpen(false)}
          />
        ) : null
      }
    >
      <Outlet context={{ onLogout: handleLogout, adminName }} />
    </AppShell>
  );
}
