import { cn } from "../../lib/cn";

export function FormField({ label, htmlFor, hint, error, required, className, children }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required ? <span className="ml-1 text-rose-300">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {!error && hint ? <p className="text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function TextField({ label, id, hint, error, className, required, ...props }) {
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <input id={id} className={cn("input-base", className)} aria-invalid={Boolean(error)} {...props} />
    </FormField>
  );
}

export function SelectField({ label, id, hint, error, className, required, children, ...props }) {
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <select id={id} className={cn("input-base", className)} aria-invalid={Boolean(error)} {...props}>
        {children}
      </select>
    </FormField>
  );
}

export function TextAreaField({ label, id, hint, error, className, required, ...props }) {
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <textarea id={id} className={cn("input-base", className)} aria-invalid={Boolean(error)} {...props} />
    </FormField>
  );
}
