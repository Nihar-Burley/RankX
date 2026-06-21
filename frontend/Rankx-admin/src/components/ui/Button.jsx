import { cn } from "../../lib/cn";

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
};

const sizeClasses = {
  sm: "px-3 py-2 text-xs",
  md: "",
  lg: "px-5 py-3 text-sm",
  icon: "h-10 w-10 px-0 py-0",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  type,
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? type || "button" : undefined}
      className={cn(variantClasses[variant] || variantClasses.primary, sizeClasses[size], className)}
      {...props}
    />
  );
}
