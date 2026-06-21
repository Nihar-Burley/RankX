import { useNavigate } from "react-router-dom";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function StudyPlanCard({ plan }) {
  const navigate = useNavigate();

  return (
    <Card
      as="button"
      type="button"
      onClick={() => navigate(`/study-plans/${plan.id}`)}
      className="w-full text-left transition hover:-translate-y-0.5 hover:border-white/12"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{plan.track}</Badge>
        <Badge tone="warning">{plan.level}</Badge>
        {plan.enrolled ? <Badge tone="success">Enrolled</Badge> : <Badge tone="neutral">Available</Badge>}
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">{plan.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          <p>{plan.totalItems} items</p>
          <p className="mt-1">{plan.enrolled ? "Continue where you left off" : "Open to preview and enroll"}</p>
        </div>
        <Button variant={plan.enrolled ? "secondary" : "primary"} size="sm">
          {plan.enrolled ? "Continue" : "Open plan"}
        </Button>
      </div>
    </Card>
  );
}
