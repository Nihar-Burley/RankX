import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import SearchFilterBar from "../components/SearchFilterBar";
import StatCard from "../components/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import { logoutUser } from "../services/authService";
import { getMyRecentSubmissions } from "../services/submissionApi";

const formatTimestamp = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString();
};

const statusTone = {
  ACCEPTED: "success",
  WRONG_ANSWER: "danger",
  RUNTIME_ERROR: "warning",
  COMPILATION_ERROR: "warning",
};

export default function SubmissionHistory() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    languageKey: "",
    problemId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const data = await getMyRecentSubmissions({
          status: filters.status || undefined,
          languageKey: filters.languageKey || undefined,
          problemId:
            filters.problemId && !Number.isNaN(Number(filters.problemId))
              ? Number(filters.problemId)
              : undefined,
        });
        setSubmissions(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login");
          return;
        }

        setError("We could not load your submission history.");
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [filters, navigate]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const acceptedCount = useMemo(
    () => submissions.filter((submission) => submission.status === "ACCEPTED").length,
    [submissions]
  );

  const languageCount = useMemo(
    () => new Set(submissions.map((submission) => submission.languageKey).filter(Boolean)).size,
    [submissions]
  );

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Coding History"
        title="Submission history"
        description="Review coding attempts, verdict patterns, and recent execution results in one cleaner workspace."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/problems")}>
              Practice again
            </Button>
            <Button onClick={() => navigate("/home")}>Back to dashboard</Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Visible submissions" value={submissions.length} detail="Attempts matching current filters" tone="cyan" />
          <StatCard label="Accepted" value={acceptedCount} detail="Successful coding submissions in view" tone="emerald" />
          <StatCard label="Languages" value={languageCount} detail="Distinct languages used across visible attempts" tone="violet" />
          <StatCard label="Latest activity" value={submissions[0] ? formatTimestamp(submissions[0].createdAt) : "No history"} detail="Most recent tracked submission time" tone="amber" />
        </div>
      </PageHeader>

      <SearchFilterBar
        searchProps={{
          id: "submission-language-search",
          label: "Filter by language",
          placeholder: "Filter by language key",
          name: "languageKey",
          value: filters.languageKey,
          onChange: handleFilterChange,
        }}
        extraFilters={
          <>
            <label className="w-full sm:w-auto">
              <span className="sr-only">Filter by status</span>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input-base min-w-[190px]"
                aria-label="Filter submissions by status"
              >
                <option value="">All statuses</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="WRONG_ANSWER">Wrong Answer</option>
                <option value="RUNTIME_ERROR">Runtime Error</option>
                <option value="COMPILATION_ERROR">Compilation Error</option>
              </select>
            </label>
            <label className="w-full sm:w-auto">
              <span className="sr-only">Filter by problem ID</span>
              <input
                name="problemId"
                value={filters.problemId}
                onChange={handleFilterChange}
                inputMode="numeric"
                placeholder="Problem ID"
                className="input-base min-w-[170px]"
                aria-label="Filter submissions by problem ID"
              />
            </label>
          </>
        }
      />

      {loading ? (
        <LoadingState
          title="Loading submission history"
          description="Preparing your coding attempts, verdicts, and execution details."
        />
      ) : error ? (
        <ErrorState
          title="Submission history is unavailable"
          message={error}
          action={
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      ) : submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Solve one problem to start building a visible coding history with verdicts, runtimes, and review details."
          action={
            <Button onClick={() => navigate("/problems")}>
              Start coding practice
            </Button>
          }
        />
      ) : (
        <DataTable
          rowKey="id"
          rows={submissions}
          onRowClick={(submission) => navigate(`/submissions/${submission.id}`)}
          columns={[
            { key: "id", header: "Submission", render: (submission) => <span className="font-medium text-white">#{submission.id}</span> },
            { key: "problemId", header: "Problem", render: (submission) => `#${submission.problemId}` },
            { key: "languageKey", header: "Language" },
            {
              key: "status",
              header: "Verdict",
              render: (submission) => (
                <Badge tone={statusTone[submission.status] || "neutral"}>{submission.status}</Badge>
              ),
            },
            {
              key: "runtimeMs",
              header: "Runtime",
              render: (submission) =>
                submission.runtimeMs != null ? `${submission.runtimeMs} ms` : "Pending",
            },
            {
              key: "createdAt",
              header: "Created",
              render: (submission) => <span className="text-slate-400">{formatTimestamp(submission.createdAt)}</span>,
            },
          ]}
          emptyTitle="No submissions match these filters"
          emptyDescription="Broaden the filters to see more attempts."
        />
      )}
    </div>
  );
}
