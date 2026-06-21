import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaClipboardList,
  FaCreditCard,
  FaHeadset,
  FaLayerGroup,
  FaUsers,
} from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";

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

const quickSignals = [
  "Publishing should stay deliberate with clear status feedback before content goes live.",
  "Question creation benefits from stronger field hierarchy and visible validation states.",
  "Responsive admin tables and filters help the console feel trustworthy on smaller devices too.",
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <div className="admin-container space-y-6">
        <PageHeader
          eyebrow="Admin Overview"
          title="Platform control center"
          description="Monitor platform health, review learning content operations, and jump into the next management workflow without digging through routes."
          actions={
            <>
              <Button variant="secondary" onClick={() => navigate("/admin/analytics/kpis")}>
                View KPI dashboard
              </Button>
              <Button onClick={() => navigate("/quizzes/create")}>Create new quiz</Button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card variant="soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Admin focus today</p>
              <p className="mt-3 text-xl font-semibold text-white">Content health, active quizzes, and operations that need attention</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The dashboard keeps the most important management areas visible so the console feels operational, not just navigational.
              </p>
            </Card>
            <Card variant="soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Priority queue</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="danger">1 urgent</Badge>
                <Badge tone="warning">1 high priority</Badge>
                <Badge tone="neutral">1 medium follow-up</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Use the queue and quick links below to move from insight to action faster.
              </p>
            </Card>
          </div>
        </PageHeader>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <StatCard key={stat.title} label={stat.title} value={stat.value} detail={stat.detail} icon={<Icon />} tone="cyan" />
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
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
          </Card>

          <Card>
            <h2 className="section-title">Operational notes</h2>
            <div className="mt-6 space-y-4">
              {quickSignals.map((note) => (
                <div key={note} className="surface-card-soft">
                  <p className="text-sm leading-6 text-slate-300">{note}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
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
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title">Operations queue</h2>
                <p className="section-copy mt-1 text-sm">
                  Highlight what the team can act on right now.
                </p>
              </div>
              <Button variant="secondary" onClick={() => navigate("/admin/reports")}>View reports</Button>
            </div>

            <div className="mt-6">
              <DataTable
                rowKey="item"
                rows={queueRows}
                columns={[
                  { key: "item", header: "Work item", render: (row) => <span className="font-medium text-white">{row.item}</span> },
                  { key: "owner", header: "Owner" },
                  {
                    key: "priority",
                    header: "Priority",
                    render: (row) => (
                      <Badge
                        tone={
                          row.priority === "Urgent"
                            ? "danger"
                            : row.priority === "High"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {row.priority}
                      </Badge>
                    ),
                  },
                ]}
              />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
