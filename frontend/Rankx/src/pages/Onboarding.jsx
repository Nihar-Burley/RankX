import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import OnboardingCard from "../components/OnboardingCard";
import OnboardingShell from "../components/OnboardingShell";
import SelectableCard from "../components/SelectableCard";
import StepProgress from "../components/StepProgress";
import { logoutUser } from "../services/authService";
import { getMyPreferences, updateMyPreferences } from "../services/userApi";
import { trackProductEvent } from "../utils/eventTracker";

const GOALS = [
  {
    key: "Interview Prep",
    title: "Interview Prep",
    description: "Prepare for real interview-style coding and quiz sessions.",
  },
  {
    key: "College/Exam Practice",
    title: "College/Exam Practice",
    description: "Stay consistent for coursework, assessments, and placement prep.",
  },
  {
    key: "Skill Improvement",
    title: "Skill Improvement",
    description: "Build stronger fundamentals and improve steadily over time.",
  },
];

const TRACKS = [
  {
    key: "Coding",
    title: "Coding",
    description: "Practice by solving coding problems and reviewing submissions.",
  },
  {
    key: "Quiz",
    title: "Quiz",
    description: "Use quiz-based practice for fast concept revision and recall.",
  },
  {
    key: "Both",
    title: "Both",
    description: "Combine coding depth with quiz repetition for balanced progress.",
  },
];

const LEVELS = [
  {
    key: "Beginner",
    title: "Beginner",
    helper: "Just getting started",
    description: "Start with clearer guidance and manageable first steps.",
  },
  {
    key: "Intermediate",
    title: "Intermediate",
    helper: "Comfortable with basics",
    description: "Build consistency and sharpen your current level.",
  },
  {
    key: "Advanced",
    title: "Advanced",
    helper: "Preparing for advanced interviews",
    description: "Push difficulty, speed, and review quality further.",
  },
];

const STEP_TITLES = ["Welcome", "Goal", "Track", "Level", "Preview"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    goal: "",
    preferredTrack: "",
    skillLevel: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadPreferences = async () => {
      try {
        const data = await getMyPreferences();

        if (data?.onboardingCompleted) {
          navigate("/home", { replace: true });
          return;
        }

        setForm({
          goal: data?.goal || "",
          preferredTrack: data?.preferredTrack || "",
          skillLevel: data?.skillLevel || "",
        });
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login", { replace: true });
          return;
        }

        setError("We could not load onboarding right now.");
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [navigate]);

  const planPreview = useMemo(() => {
    const track = form.preferredTrack || "Both";
    const level = form.skillLevel || "Beginner";
    const goal = form.goal || "Skill Improvement";

    const recommendedPlanTitle =
      track === "Coding"
        ? `${level} Coding Path`
        : track === "Quiz"
          ? `${level} Quiz Path`
          : `${level} Mixed Practice Path`;

    const firstAction =
      track === "Coding"
        ? "Open practice and solve one coding problem."
        : track === "Quiz"
          ? "Start one short quiz session."
          : "Begin with one quiz, then continue into one coding problem.";

    const returnReason =
      goal === "Interview Prep"
        ? "Returning daily helps build speed and confidence."
        : goal === "College/Exam Practice"
          ? "Short, repeat sessions improve retention."
          : "Consistent practice compounds into better long-term skill growth.";

    return {
      recommendedPlanTitle,
      firstAction,
      returnReason,
    };
  }, [form]);

  const canContinue = useMemo(() => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return Boolean(form.goal);
    if (currentStep === 2) return Boolean(form.preferredTrack);
    if (currentStep === 3) return Boolean(form.skillLevel);
    if (currentStep === 4) return true;
    return false;
  }, [currentStep, form]);

  const handleNext = async () => {
    if (!canContinue) {
      setError("Please complete this step before continuing.");
      return;
    }

    setError("");

    if (currentStep === STEP_TITLES.length - 1) {
      try {
        setSubmitting(true);
        await updateMyPreferences(form);
        trackProductEvent({
          eventName: "ONBOARDING_COMPLETED",
          eventCategory: "ONBOARDING",
          source: "WEB",
          track: form.preferredTrack,
          topic: form.goal,
          outcome: form.skillLevel,
        });
        navigate("/home", { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "We could not save your preferences.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setCurrentStep((step) => step + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/home");
      return;
    }

    setError("");
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const stepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingCard
            title="Set up your learning workspace"
            description="Answer a few quick questions so RankX can show the right path and the right next step from your first session."
            eyebrow="Welcome"
          >
            <div className="surface-card-soft">
              <p className="text-sm leading-6 text-slate-300">
                This takes less than a minute and helps RankX decide what you should do first.
              </p>
            </div>
          </OnboardingCard>
        );
      case 1:
        return (
          <OnboardingCard title="What is your main goal?" description="Pick the outcome you care about most right now.">
            <div className="grid gap-4 lg:grid-cols-3">
              {GOALS.map((goal) => (
                <SelectableCard
                  key={goal.key}
                  title={goal.title}
                  description={goal.description}
                  selected={form.goal === goal.key}
                  onClick={() => setForm((current) => ({ ...current, goal: goal.key }))}
                />
              ))}
            </div>
          </OnboardingCard>
        );
      case 2:
        return (
          <OnboardingCard
            title="Which track should RankX prioritize?"
            description="Choose the practice style you want to spend more time in."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {TRACKS.map((track) => (
                <SelectableCard
                  key={track.key}
                  title={track.title}
                  description={track.description}
                  selected={form.preferredTrack === track.key}
                  onClick={() => setForm((current) => ({ ...current, preferredTrack: track.key }))}
                />
              ))}
            </div>
          </OnboardingCard>
        );
      case 3:
        return (
          <OnboardingCard
            title="How would you describe your current level?"
            description="We will use this to keep your first action clear and appropriate."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {LEVELS.map((level) => (
                <SelectableCard
                  key={level.key}
                  title={level.title}
                  helper={level.helper}
                  description={level.description}
                  selected={form.skillLevel === level.key}
                  onClick={() => setForm((current) => ({ ...current, skillLevel: level.key }))}
                />
              ))}
            </div>
          </OnboardingCard>
        );
      case 4:
        return (
          <OnboardingCard
            title="Your plan preview"
            description="Review the path RankX will start you on and begin learning."
            eyebrow="Preview"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Recommended path", planPreview.recommendedPlanTitle],
                ["First recommended action", planPreview.firstAction],
                ["Selected goal", form.goal],
                ["Why return tomorrow", planPreview.returnReason],
              ].map(([label, value]) => (
                <div key={label} className="surface-card-soft">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-3 text-sm leading-6 text-white">{value}</p>
                </div>
              ))}
            </div>
          </OnboardingCard>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingState title="Loading onboarding" description="Preparing your personalized setup flow." />;
  }

  if (error && currentStep === 0) {
    return (
      <ErrorState
        message={error}
        action={
          <button type="button" onClick={() => navigate("/home")} className="btn-secondary">
            Back to dashboard
          </button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen px-0 py-0">
      <OnboardingShell
        title={STEP_TITLES[currentStep]}
        subtitle="A quick setup so your dashboard feels clearer from the very first session."
        progress={<StepProgress steps={STEP_TITLES} currentStep={currentStep} />}
        actions={
          <>
            <button type="button" onClick={handleBack} className="btn-secondary">
              {currentStep === 0 ? "Skip for now" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue || submitting}
              className="btn-primary"
            >
              {submitting ? "Saving..." : currentStep === STEP_TITLES.length - 1 ? "Start learning" : "Continue"}
            </button>
          </>
        }
      >
        <div key={currentStep}>{stepContent()}</div>

        {error && currentStep > 0 ? <ErrorState title="We need one quick fix" message={error} /> : null}
      </OnboardingShell>
    </div>
  );
}
