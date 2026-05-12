export default function LoadingState({ title = "Loading...", description = "Preparing your workspace." }) {
  return (
    <div className="surface-card flex min-h-56 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-teal-400/12" />
        <p className="mt-4 text-base font-medium text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
