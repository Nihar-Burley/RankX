import { cn } from "../lib/cn";

function FieldIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-4 w-4",
    "aria-hidden": "true",
  };

  switch (name) {
    case "user":
      return (
        <svg {...common}>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M15.2 3.5h-6.4A1.8 1.8 0 0 0 7 5.3v13.4a1.8 1.8 0 0 0 1.8 1.8h6.4a1.8 1.8 0 0 0 1.8-1.8V5.3a1.8 1.8 0 0 0-1.8-1.8Z" />
          <path d="M11 17.5h2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.8 6 6.2v5.2c0 3.95 2.45 7.6 6 8.8 3.55-1.2 6-4.85 6-8.8V6.2L12 3.8Z" />
          <path d="m9.25 12.4 1.75 1.8 3.75-4.1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AuthInput({
  label,
  type,
  placeholder,
  value,
  onChange,
  id,
  autoComplete,
  inputMode,
  icon,
  trailing,
}) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={inputId} className="text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">
            <FieldIcon name={icon} />
          </span>
        ) : null}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={cn(
            "h-14 w-full rounded-2xl border border-white/10 bg-[#0f141d] text-sm text-white outline-none transition duration-200 placeholder:text-[#556176]",
            "focus:border-[#7c69ff] focus:bg-[#111725] focus:ring-4 focus:ring-[#7c69ff]/12",
            icon ? "pl-12 pr-4" : "px-4",
            trailing ? "pr-12" : "",
          )}
        />
        {trailing ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b]">{trailing}</div>
        ) : null}
      </div>
    </div>
  );
}
