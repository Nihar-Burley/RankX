import Card from "./ui/Card";

export default function ErrorState({ title = "Something went wrong", message, action }) {
  return (
    <Card className="rounded-[28px] border-amber-500/30 bg-amber-500/10">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-amber-100">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
