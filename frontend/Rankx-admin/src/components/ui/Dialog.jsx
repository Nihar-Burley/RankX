import Button from "./Button";
import Card from "./Card";

export default function Dialog({
  open,
  title,
  description,
  onClose,
  actions,
  children,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <Card className="relative z-10 w-full max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
        {actions ? <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div> : null}
      </Card>
    </div>
  );
}
