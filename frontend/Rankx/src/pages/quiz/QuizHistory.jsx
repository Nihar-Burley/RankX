import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SearchFilterBar from "../../components/SearchFilterBar";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { logoutUser } from "../../services/authService";
import { getMyResults } from "../../services/resultApi";

const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;

export default function QuizHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    quizId: "",
    minimumPercentage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        const response = await getMyResults({
          quizId: filters.quizId || undefined,
          minimumPercentage:
            filters.minimumPercentage !== "" && !Number.isNaN(Number(filters.minimumPercentage))
              ? Number(filters.minimumPercentage)
              : undefined,
        });
        setResults(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login");
          return;
        }

        setError("We could not load your quiz history.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [filters, navigate]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const passedCount = useMemo(
    () => results.filter((result) => Number(result.percentage || 0) >= 40).length,
    [results]
  );

  const averageScore = useMemo(() => {
    if (!results.length) {
      return "0%";
    }

    const average =
      results.reduce((sum, result) => sum + Number(result.percentage || 0), 0) / results.length;
    return `${average.toFixed(0)}%`;
  }, [results]);

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Quiz History"
        title="Quiz results"
        description="Review your attempts, spot score patterns, and jump straight into detailed review when you need to understand a result."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/quiz")}>
              Browse quizzes
            </Button>
            <Button onClick={() => navigate("/home")}>Back to dashboard</Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Visible attempts" value={results.length} detail="Quiz results matching current filters" tone="cyan" />
          <StatCard label="Passed" value={passedCount} detail="Attempts at or above the current pass threshold" tone="emerald" />
          <StatCard label="Average score" value={averageScore} detail="Average percentage across visible attempts" tone="amber" />
          <StatCard label="Best score" value={results.length ? formatPercentage(Math.max(...results.map((result) => Number(result.percentage || 0)))) : "0%"} detail="Highest visible percentage" tone="violet" />
        </div>
      </PageHeader>

      <SearchFilterBar
        searchProps={{
          id: "quiz-history-id",
          label: "Filter by quiz ID",
          placeholder: "Filter by quiz ID",
          name: "quizId",
          value: filters.quizId,
          onChange: handleFilterChange,
        }}
        extraFilters={
          <label className="w-full sm:w-auto">
            <span className="sr-only">Filter by minimum score percentage</span>
            <input
              name="minimumPercentage"
              value={filters.minimumPercentage}
              onChange={handleFilterChange}
              inputMode="decimal"
              placeholder="Minimum score %"
              className="input-base min-w-[180px]"
              aria-label="Filter quiz history by minimum score percentage"
            />
          </label>
        }
      />

      {loading ? (
        <LoadingState title="Loading quiz history" description="Preparing your attempts, score patterns, and review links." />
      ) : error ? (
        <ErrorState
          title="Quiz history is unavailable"
          message={error}
          action={
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No quiz results yet"
          description="Attempt one quiz to start building visible score history, review links, and progress signals."
          action={<Button onClick={() => navigate("/quiz")}>Start a quiz</Button>}
        />
      ) : (
        <DataTable
          rowKey="attemptId"
          rows={results}
          onRowClick={(result) => navigate(`/quiz/review/${result.attemptId}`)}
          columns={[
            { key: "attemptId", header: "Attempt", render: (result) => <span className="font-medium text-white">#{result.attemptId}</span> },
            { key: "quizId", header: "Quiz", render: (result) => `#${result.quizId}` },
            {
              key: "score",
              header: "Score",
              render: (result) => `${result.score}/${result.totalQuestions}`,
            },
            {
              key: "percentage",
              header: "Percentage",
              render: (result) => (
                <Badge tone={Number(result.percentage || 0) >= 40 ? "success" : "warning"}>
                  {formatPercentage(result.percentage)}
                </Badge>
              ),
            },
          ]}
          emptyTitle="No quiz attempts match these filters"
          emptyDescription="Adjust the quiz ID or minimum score filters to broaden the view."
        />
      )}
    </div>
  );
}
