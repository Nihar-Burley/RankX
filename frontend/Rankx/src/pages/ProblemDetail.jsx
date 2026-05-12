import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProblemWorkspace from "../components/ProblemWorkspace";
import api from "../services/api";

export default function ProblemDetail() {
  const { id } = useParams();
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
        <div role="alert" className="surface-card w-full max-w-xl rounded-[28px] text-center">
          <h1 className="text-2xl font-semibold text-white">Problem unavailable</h1>
          <p className="mt-3 text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !problem) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="surface-card w-full max-w-xl rounded-[28px] text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-teal-400/15" />
          <p className="mt-4 text-sm text-slate-300">Loading problem workspace...</p>
        </div>
      </div>
    );
  }

  return <ProblemWorkspace key={problem.id} problem={problem} />;
}
