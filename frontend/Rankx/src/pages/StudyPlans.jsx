import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import Button from "../components/ui/Button";
import { logoutUser } from "../services/authService";
import {
  getMyProgressSummary,
  getMyStudyPlans,
  getStudyPlanProgress,
  getStudyPlans,
} from "../services/userApi";

const progressStateTone = {
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  NEXT: "border-[#b9b2ff] bg-[#f2efff] text-[#4f46e5]",
  LOCKED: "border-slate-200 bg-[#f8fafc] text-slate-500",
};

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function PlanGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 4.5h9a2.5 2.5 0 0 1 2.5 2.5v12l-4.5-2-4.5 2V7A2.5 2.5 0 0 1 11 4.5Z" />
      <path d="M8.5 8.5h5M8.5 11.5h5" />
    </svg>
  );
}

function ProgressRing({ value }) {
  const bounded = Math.max(0, Math.min(Math.round(value || 0), 100));
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (bounded / 100) * circumference;

  return (
    <div className="relative h-[88px] w-[88px]">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="#6f63ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[1.55rem] font-semibold tracking-[-0.05em] text-[#111827]">{bounded}%</span>
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">done</span>
      </div>
    </div>
  );
}

function formatTrack(track) {
  return String(track || "Plan")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StreakDay({ active, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
          active ? "border-[#6f63ff] bg-[#6f63ff] text-white" : "border-slate-200 bg-white text-slate-400"
        }`}
      >
        {active ? "o" : ""}
      </span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

export default function StudyPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [myPlans, setMyPlans] = useState([]);
  const [activeProgress, setActiveProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const [studyPlans, progressSummary, userPlans] = await Promise.all([
          getStudyPlans(),
          getMyProgressSummary().catch(() => null),
          getMyStudyPlans().catch(() => []),
        ]);

        const normalizedPlans = Array.isArray(studyPlans) ? studyPlans : [];
        const normalizedUserPlans = Array.isArray(userPlans) ? userPlans : [];
        const activePlanId =
          progressSummary?.currentPlan?.studyPlanId ||
          normalizedUserPlans[0]?.studyPlanId ||
          normalizedPlans.find((plan) => plan.enrolled)?.id;

        setPlans(normalizedPlans);
        setSummary(progressSummary);
        setMyPlans(normalizedUserPlans);

        if (activePlanId) {
          const progress = await getStudyPlanProgress(activePlanId).catch(() => null);
          setActiveProgress(progress);
        } else {
          setActiveProgress(null);
        }

        setError("");
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

  const activePlanId =
    summary?.currentPlan?.studyPlanId ||
    myPlans[0]?.studyPlanId ||
    plans.find((plan) => plan.enrolled)?.id ||
    null;

  const activePlan = useMemo(() => {
    if (!activePlanId) {
      return null;
    }
    return plans.find((plan) => plan.id === activePlanId) || null;
  }, [activePlanId, plans]);

  const milestoneRows = useMemo(() => {
    if (!activeProgress?.items?.length) {
      return [];
    }
    return activeProgress.items.slice(0, 5);
  }, [activeProgress]);

  const recommendationCards = useMemo(() => {
    const nextItem = activeProgress?.items?.find((item) => item.progressState === "NEXT");
    const alternatePlan = plans.find((plan) => plan.id !== activePlanId);

    return [
      nextItem
        ? {
            eyebrow: "Priority",
            type: nextItem.itemType === "QUIZ" ? "Quiz" : "Problem",
            title: nextItem.title,
            description: "Continue the active study path while the current topic context is still fresh.",
          }
        : null,
      activePlan
        ? {
            eyebrow: "Suggested",
            type: formatTrack(activePlan.track),
            title: `${activePlan.title} - momentum check`,
            description: `Stay aligned with the ${formatTrack(activePlan.track).toLowerCase()} path already guiding your progress.`,
          }
        : null,
      alternatePlan
        ? {
            eyebrow: "Upcoming",
            type: formatTrack(alternatePlan.track),
            title: alternatePlan.title,
            description: "Preview another guided path before you decide what to queue after the current milestone.",
          }
        : null,
    ].filter(Boolean);
  }, [activePlan, activePlanId, activeProgress, plans]);

  const weeklyGoalValue = Math.min(summary?.streakCount || 0, 5);

  if (loading) {
    return <LoadingState title="Loading study plans" description="Preparing the active roadmap and guided paths." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Study plans are unavailable right now"
        message={error}
        action={
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!plans.length) {
    return (
      <EmptyState
        title="No study plans are available yet"
        description="When guided plans are published, they will appear here with the right learning track and enrollment context."
      />
    );
  }

  return (
    <div className="space-y-8 text-[#111827]">
      <section className="space-y-6">
        <div className="max-w-[860px]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Study plans</p>
          <h1 className="mt-4 text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.045em] text-[#111827] sm:text-[3.4rem]">
            Guided study plans built around progress, momentum, and what to do next
          </h1>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.7fr]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
                  <PlanGlyph />
                  Active plan
                </div>
                <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[#111827]">
                  {activePlan?.title || summary?.currentPlan?.title || "Choose a study plan"}
                </h2>
                <p className="mt-3 max-w-[700px] text-base leading-7 text-slate-500">
                  {activePlan?.description ||
                    "A structured plan keeps momentum visible, recommendations more relevant, and each next step easier to trust."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activePlan?.track ? (
                    <span className="rounded-full bg-[#f2efff] px-3 py-1 text-xs font-semibold text-[#5b4df7]">
                      {formatTrack(activePlan.track)}
                    </span>
                  ) : null}
                  {activePlan?.level ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {formatTrack(activePlan.level)}
                    </span>
                  ) : null}
                  {activePlan?.totalItems ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {activePlan.totalItems} items
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 rounded-[24px] bg-[#fbfbff] p-5 xl:grid-cols-[0.34fr_0.66fr]">
              <div className="flex items-center justify-center">
                <ProgressRing value={activeProgress?.completionPercentage || summary?.currentPlan?.completionPercentage || 0} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827]">
                    {activeProgress?.completedItems ?? 0}/{activeProgress?.totalItems ?? activePlan?.totalItems ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Modules done</p>
                </div>
                <div>
                  <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827]">
                    {summary?.enrolledPlans ?? myPlans.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Plans enrolled</p>
                </div>
                <div>
                  <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827]">
                    {activeProgress?.nextItemTitle ? "Ready" : "Queued"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Next session state</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activePlanId) {
                  navigate(`/study-plans/${activePlanId}`);
                }
              }}
              className="mt-5 flex w-full items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">Up next</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">
                  {activeProgress?.nextItemTitle || summary?.currentPlan?.nextItemTitle || "Open the roadmap"}
                </p>
              </div>
              <span className="text-xl text-slate-400">-&gt;</span>
            </button>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
              <PlanGlyph />
              Streak tracker
            </div>
            <h2 className="mt-4 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#111827]">
              Consistency builds mastery
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <p className="text-[2.35rem] font-semibold tracking-[-0.06em] text-[#111827]">{summary?.streakCount ?? 0}</p>
                <p className="text-sm text-slate-500">Day streak</p>
              </div>
              <div>
                <p className="text-[2.35rem] font-semibold tracking-[-0.06em] text-[#111827]">
                  {Math.max(summary?.streakCount ?? 0, 0) + 7}
                </p>
                <p className="text-sm text-slate-500">Best streak</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">This week</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                {weekLabels.map((label, index) => (
                  <StreakDay key={label} label={label} active={index < Math.min(summary?.streakCount || 0, 7)} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>Weekly goal</span>
                <span>{weeklyGoalValue}/5 sessions</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-[#d9d6ff]">
                <div
                  className="h-1.5 rounded-full bg-[#6f63ff]"
                  style={{ width: `${Math.min((weeklyGoalValue / 5) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-500">
              <div>
                <p className="text-lg font-semibold text-[#111827]">{(summary?.streakCount ?? 0) * 6 + 5}</p>
                <p>Total sessions</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#111827]">42 min</p>
                <p>Avg. session</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
            <PlanGlyph />
            Milestone modules
          </div>
          <h2 className="mt-4 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#111827]">Your curriculum roadmap</h2>

          <div className="mt-5 space-y-3">
            {milestoneRows.length ? (
              milestoneRows.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => {
                    if (activePlanId) {
                      navigate(`/study-plans/${activePlanId}`);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-4 text-left transition ${
                    progressStateTone[item.progressState] || progressStateTone.LOCKED
                  }`}
                >
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs opacity-80">Step {item.sequenceNumber}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    {item.progressState === "COMPLETED"
                      ? "Done"
                      : item.progressState === "NEXT"
                        ? "Active"
                        : "Locked"}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Enroll in a plan to reveal the step-by-step roadmap.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
            <PlanGlyph />
            Personalized recommendations
          </div>
          <h2 className="mt-4 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#111827]">Tailored to your gaps and goals</h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {recommendationCards.map((card) => (
              <button
                key={`${card.eyebrow}-${card.title}`}
                type="button"
                onClick={() => {
                  if (activePlanId) {
                    navigate(`/study-plans/${activePlanId}`);
                  }
                }}
                className="rounded-[20px] border border-slate-200 bg-[#fbfbff] px-4 py-4 text-left transition hover:border-[#cfc9ff] hover:shadow-[0_14px_36px_rgba(111,99,255,0.10)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#efeaff] px-3 py-1 text-[11px] font-semibold text-[#5b4df7]">
                    {card.eyebrow}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{card.type}</span>
                </div>
                <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#111827]">{card.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{card.description}</p>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Available paths</p>
            <h2 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.04em] text-[#111827]">
              Explore the full plan library
            </h2>
          </div>
          <Button type="button" variant="secondary" className="border-slate-200 bg-white text-[#111827] hover:bg-slate-50" onClick={() => navigate("/my-progress")}>
            View my progress
          </Button>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {plans.map((plan) => {
            const enrollment = myPlans.find((item) => item.studyPlanId === plan.id);
            const isActive = activePlanId === plan.id;
            return (
              <article
                key={plan.id}
                className={`rounded-[24px] border bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)] ${
                  isActive ? "border-[#cfc9ff]" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f2efff] px-3 py-1 text-xs font-semibold text-[#5b4df7]">
                        {formatTrack(plan.track)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        {formatTrack(plan.level)}
                      </span>
                      {plan.enrolled ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Enrolled
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.04em] text-[#111827]">{plan.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{plan.description}</p>
                  </div>
                  {enrollment?.completionPercentage != null ? (
                    <div className="text-right">
                      <p className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[#111827]">
                        {Math.round(enrollment.completionPercentage)}%
                      </p>
                      <p className="text-xs text-slate-500">complete</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{plan.totalItems || 0} items</span>
                  {enrollment?.nextItemTitle ? <span>Next: {enrollment.nextItemTitle}</span> : null}
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => navigate(`/study-plans/${plan.id}`)}
                  >
                    {plan.enrolled ? "Continue Plan" : "Open Plan"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
