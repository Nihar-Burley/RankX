import { cn } from "../../lib/cn";

const toneClasses = {
  neutral: "badge-neutral",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  brand: "badge-brand",
};

export default function Badge({ tone = "neutral", className, children }) {
  return <span className={cn("badge", toneClasses[tone] || toneClasses.neutral, className)}>{children}</span>;
}
