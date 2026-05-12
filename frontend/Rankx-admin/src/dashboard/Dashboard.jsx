import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaClipboardList,
  FaCreditCard,
  FaHeadset,
  FaLayerGroup,
  FaUsers,
} from "react-icons/fa";

const stats = [
  { title: "Total users", value: "1,200", detail: "Registered accounts", icon: FaUsers },
  { title: "Active quizzes", value: "35", detail: "Currently available", icon: FaClipboardList },
  { title: "Content modules", value: "48", detail: "Questions and quizzes", icon: FaLayerGroup },
  { title: "Weekly activity", value: "+18%", detail: "Compared with last week", icon: FaChartLine },
];

const actions = [
  {
    name: "Manage quizzes",
    description: "Create, publish, and maintain timed assessments.",
    onClick: (navigate) => navigate("/quizzes"),
  },
  {
    name: "Create quiz",
    description: "Start a new quiz draft and continue into question setup.",
    onClick: (navigate) => navigate("/quizzes/create"),
  },
  {
    name: "Question library",
    description: "Review questions attached to active quiz workflows.",
    onClick: (navigate) => navigate("/quizzes"),
  },
  {
    name: "Users management",
    description: "Review members, roles, and onboarding activity.",
    onClick: (navigate) => navigate("/admin/users"),
  },
  {
    name: "Billing operations",
    description: "Monitor payments, plans, and invoice health.",
    onClick: (navigate) => navigate("/admin/payments"),
  },
  {
    name: "Support queue",
    description: "See support demand and ticket priorities.",
    onClick: (navigate) => navigate("/admin/support"),
  },
];

const managementAreas = [
  {
    title: "Users",
    copy: "Administer accounts, access, and onboarding health.",
    icon: FaUsers,
    route: "/admin/users",
  },
  {
    title: "Plans",
    copy: "Configure subscriptions and packaging visibility.",
    icon: FaLayerGroup,
    route: "/admin/plans",
  },
  {
    title: "Payments",
    copy: "Review invoice status, failed charges, and revenue signals.",
    icon: FaCreditCard,
    route: "/admin/payments",
  },
  {
    title: "Reports",
    copy: "Watch product, billing, and operational performance.",
    icon: FaChartLine,
    route: "/admin/reports",
  },
  {
    title: "Support",
    copy: "Track ticket queues and escalations.",
    icon: FaHeadset,
    route: "/admin/support",
  },
];

const queueRows = [
  { item: "Trial users awaiting follow-up", owner: "Growth", priority: "Medium" },
  { item: "Failed enterprise invoice review", owner: "Finance", priority: "High" },
  { item: "Support ticket backlog audit", owner: "Support", priority: "Urgent" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <div className="admin-container space-y-6">
        <header className="page-header">
          <p className="eyebrow">Admin Overview</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Control center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                A cleaner administrative surface for monitoring platform health,
                reviewing content operations, and moving quickly between quiz workflows.
              </p>
            </div>
            <button onClick={() => navigate("/quizzes/create")} className="btn-primary">
              Create new quiz
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.title} className="stat-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/12 text-sky-300">
                    <Icon />
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title">Primary actions</h2>
                <p className="section-copy mt-1 text-sm">
                  Keep the core admin workflows close at hand.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {actions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => action.onClick(navigate)}
                  className="surface-card-soft text-left transition hover:-translate-y-0.5 hover:border-white/12"
                >
                  <h3 className="text-base font-semibold text-white">{action.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card">
            <h2 className="section-title">Operational notes</h2>
            <div className="mt-6 space-y-4">
              {[
                "Publishing should remain deliberate, with clear status feedback.",
                "Question creation benefits from tighter form hierarchy and validation visibility.",
                "Responsive list and filter layouts help the admin app feel production-ready on smaller devices.",
              ].map((note) => (
                <div key={note} className="surface-card-soft">
                  <p className="text-sm leading-6 text-slate-300">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card">
            <h2 className="section-title">Management areas</h2>
            <p className="section-copy mt-1 text-sm">
              Make every major admin domain explicit and reachable.
            </p>

            <div className="mt-6 grid gap-4">
              {managementAreas.map((area) => {
                const Icon = area.icon;

                return (
                  <button
                    key={area.title}
                    onClick={() => navigate(area.route)}
                    className="surface-card-soft flex items-start gap-4 text-left transition hover:-translate-y-0.5 hover:border-white/12"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/12 text-sky-300">
                      <Icon />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{area.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{area.copy}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title">Operations queue</h2>
                <p className="section-copy mt-1 text-sm">
                  Highlight what the team can act on right now.
                </p>
              </div>
              <button onClick={() => navigate("/admin/reports")} className="btn-secondary">
                View reports
              </button>
            </div>

            <div className="mt-6 table-shell overflow-x-auto">
              <table className="min-w-full">
                <thead className="table-head">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-5 py-4">Work item</th>
                    <th className="px-5 py-4">Owner</th>
                    <th className="px-5 py-4">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {queueRows.map((row) => (
                    <tr key={row.item} className="border-t border-white/5 text-sm text-slate-200">
                      <td className="px-5 py-4 font-medium text-white">{row.item}</td>
                      <td className="px-5 py-4">{row.owner}</td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            row.priority === "Urgent"
                              ? "badge-danger"
                              : row.priority === "High"
                                ? "badge-warning"
                                : "badge-neutral"
                          }
                        >
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
