import Card from "./ui/Card";
import { cn } from "../lib/cn";

export default function StatCard({ label, value, detail, tone = "neutral", icon }) {
  const toneClass = {
    neutral: "border-white/8 bg-white/[0.03]",
    cyan: "border-cyan-400/20 bg-cyan-400/6",
    emerald: "border-emerald-400/20 bg-emerald-400/6",
    amber: "border-amber-400/20 bg-amber-400/6",
    violet: "border-violet-400/20 bg-violet-400/6",
  };

  return (
    <Card variant="stat" className={cn(toneClass[tone] || toneClass.neutral)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{value}</p>
          {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
        </div>
        {icon ? <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200">{icon}</span> : null}
      </div>
    </Card>
  );
}
