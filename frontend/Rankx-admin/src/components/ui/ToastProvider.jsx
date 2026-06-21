import { useCallback, useMemo, useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import { ToastContext } from "./toast-context";

const toneToBadge = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, description, tone = "info", duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <Card key={toast.id} className="pointer-events-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone={toneToBadge[toast.tone] || "info"}>{toast.tone}</Badge>
                <p className="mt-3 text-sm font-semibold text-white">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm leading-6 text-slate-400">{toast.description}</p> : null}
              </div>
              <Button variant="ghost" size="sm" onClick={() => dismissToast(toast.id)}>
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
