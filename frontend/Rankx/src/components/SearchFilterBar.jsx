import Card from "./ui/Card";

export default function SearchFilterBar({ searchProps, extraFilters }) {
  return (
    <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="w-full lg:max-w-md">
        <label htmlFor={searchProps.id || "search"} className="sr-only">
          {searchProps.label || "Search"}
        </label>
        <input
          id={searchProps.id || "search"}
          type="search"
          className="input-base"
          {...searchProps}
        />
      </div>
      {extraFilters ? <div className="flex flex-wrap gap-3">{extraFilters}</div> : null}
    </Card>
  );
}
