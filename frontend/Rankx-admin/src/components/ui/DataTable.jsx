import Card from "./Card";
import LoadingSkeleton from "./LoadingSkeleton";

function LocalEmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

export default function DataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyTitle = "No records yet",
  emptyDescription = "Data will appear here when it becomes available.",
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <Card className={className}>
        <LoadingSkeleton lines={6} />
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className={className}>
        <LocalEmptyState title={emptyTitle} description={emptyDescription} />
      </Card>
    );
  }

  return (
    <div className={`table-shell overflow-x-auto ${className || ""}`.trim()}>
      <table className="min-w-full border-collapse">
        <thead className="table-head">
          <tr className="border-b border-white/10 text-left">
            {columns.map((column) => (
              <th key={column.key} className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const interactive = typeof onRowClick === "function";
            return (
              <tr
                key={rowKey ? row[rowKey] : index}
                tabIndex={interactive ? 0 : undefined}
                onClick={interactive ? () => onRowClick(row, index) : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row, index);
                        }
                      }
                    : undefined
                }
                className={`table-row border-b border-white/5 text-sm text-slate-200 last:border-b-0 ${
                  interactive ? "cursor-pointer focus:outline-none focus-visible:bg-slate-800/80" : ""
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 align-top">
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
