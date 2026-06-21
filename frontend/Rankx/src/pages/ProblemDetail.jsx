import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import Button from "../components/ui/Button";
import ProblemWorkspace from "../components/ProblemWorkspace";
import api from "../services/api";

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        if (cancelled) return;
        setProblem(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setProblem(null);
        setError("We couldn't load this problem right now.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadProblem();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <ErrorState
            title="Problem unavailable"
            message={error}
            action={
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/problems")}>Back to practice</Button>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  if (loading || !problem) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <LoadingState
            title="Loading problem workspace"
            description="Preparing the problem statement, coding surface, and evaluation tools."
          />
        </div>
      </div>
    );
  }

  return <ProblemWorkspace key={problem.id} problem={problem} />;
}
