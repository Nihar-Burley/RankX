import Card from "./ui/Card";

export default function EmptyState({ title, description, action }) {
  return (
    <Card variant="soft" className="empty-state">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
