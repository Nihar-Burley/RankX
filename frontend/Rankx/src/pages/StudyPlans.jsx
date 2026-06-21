import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StudyPlanCard from "../components/StudyPlanCard";
import { logoutUser } from "../services/authService";
import { getStudyPlans } from "../services/userApi";

export default function StudyPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await getStudyPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login", { replace: true });
          return;
        }
        setError("We could not load study plans right now.");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [navigate]);

  const enrolledPlans = plans.filter((plan) => plan.enrolled).length;
  const codingPlans = plans.filter((plan) => plan.track === "CODING" || plan.track === "BOTH").length;
  const quizPlans = plans.filter((plan) => plan.track === "QUIZ" || plan.track === "BOTH").length;

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Study Plans"
        title="Choose a guided path, not just another task"
        description="Each study plan gives RankX a reliable structure for progress, recommendations, and next-step guidance across coding and quiz practice."
        actions={
          <>
            <button type="button" onClick={() => navigate("/my-progress")} className="btn-secondary">
              View my progress
            </button>
            <button type="button" onClick={() => navigate("/home")} className="btn-primary">
              Back to dashboard
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Available paths" value={plans.length} detail="Structured learning programs" tone="cyan" />
          <StatCard label="Already enrolled" value={enrolledPlans} detail="Plans actively guiding your work" tone="emerald" />
          <StatCard label="Track coverage" value={`${codingPlans}/${quizPlans}`} detail="Coding-ready and quiz-ready plan mix" tone="violet" />
        </div>
      </PageHeader>

      {loading ? (
        <LoadingState title="Loading study plans" description="Preparing recommended paths and enrollment status." />
      ) : error ? (
        <ErrorState
          title="Study plans are unavailable right now"
          message={error}
          action={
            <button type="button" onClick={() => window.location.reload()} className="btn-secondary">
              Try again
            </button>
          }
        />
      ) : plans.length === 0 ? (
        <EmptyState
          title="No study plans are available yet"
          description="When new guided paths are published, they will appear here with the right track, level, and enrollment options."
          action={
            <button type="button" onClick={() => navigate("/support")} className="btn-secondary">
              Contact support
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {plans.map((plan) => (
            <StudyPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
