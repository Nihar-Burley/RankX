import { createElement } from "react";
import { cn } from "../../lib/cn";

const variantClasses = {
  elevated: "surface-card",
  soft: "surface-card-soft",
  stat: "stat-card",
};

export default function Card({
  as = "section",
  variant = "elevated",
  className,
  children,
  ...props
}) {
  return createElement(
    as,
    { className: cn(variantClasses[variant] || variantClasses.elevated, className), ...props },
    children
  );
}
