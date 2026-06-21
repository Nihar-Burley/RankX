export default function PageSection({ title, description, action, children, className = "" }) {
  return (
    <section className={`surface-card ${className}`.trim()}>
      {title || description || action ? (
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="section-title">{title}</h2> : null}
            {description ? <p className="section-copy mt-2 text-sm leading-6">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
        </div>
      ) : null}
      <div className={title || description || action ? "pt-5" : ""}>{children}</div>
    </section>
  );
}
