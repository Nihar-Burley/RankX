import Card from "./ui/Card";
import LoadingSkeleton from "./ui/LoadingSkeleton";

export default function LoadingState({ title = "Loading...", description = "Preparing your workspace." }) {
  return (
    <Card className="flex min-h-56 items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-400/12">
          <div className="h-6 w-6 animate-pulse rounded-full bg-teal-300/30" />
        </div>
        <p className="mt-4 text-base font-medium text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <LoadingSkeleton lines={3} className="mt-6" compact />
      </div>
    </Card>
  );
}
