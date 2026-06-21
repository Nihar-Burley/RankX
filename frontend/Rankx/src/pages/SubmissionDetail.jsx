import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { logoutUser } from "../services/authService";
import { getProblemAttemptSummary, getSubmissionDetail } from "../services/submissionApi";
import { trackProductEvent } from "../utils/eventTracker";

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

export default function SubmissionDetail() {
  const navigate = useNavigate();
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [problemSummary, setProblemSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadSubmission = async () => {
      try {
        const data = await getSubmissionDetail(submissionId);
        setSubmission(data);
        trackProductEvent(
          {
            eventName: "CODING_SUBMISSION_DETAIL_VIEWED",
            eventCategory: "CODING",
            source: "WEB",
            track: "CODING",
            contentType: "SUBMISSION",
            contentId: `submission-${submissionId}`,
            contentTitle: `Submission ${submissionId}`,
            parentContentId: data?.problemId ? `problem-${data.problemId}` : undefined,
          },
          { oncePerSessionKey: `submission-detail-${submissionId}` }
        );
        setError("");
        try {
          const summary = await getProblemAttemptSummary(data.problemId);
          setProblemSummary(summary);
        } catch {
          setProblemSummary(null);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login");
          return;
        }

        setError("We could not load this submission.");
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [navigate, submissionId]);

  if (loading) {
    return (
      <div className="app-container">
        <LoadingState title="Loading submission details" description="Preparing verdict, performance, and problem-summary insights." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <ErrorState
          title="Submission detail is unavailable"
          message={error}
          action={
            <Button variant="secondary" onClick={() => navigate("/submissions")}>
              Back to history
            </Button>
          }
        />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="app-container">
        <EmptyState
          title="Submission detail is unavailable"
          description="This coding attempt may no longer be accessible."
          action={<Button variant="secondary" onClick={() => navigate("/submissions")}>Back to history</Button>}
        />
      </div>
    );
  }

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Coding Review"
        title={`Submission #${submissionId}`}
        description="Inspect the verdict, runtime profile, and broader problem-attempt context to understand how this coding attempt fits your learning progress."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/submissions")}>
              Back to history
            </Button>
            <Button onClick={() => navigate(`/problems/${submission.problemId}`)}>
              Reopen problem
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone[submission.status] || "neutral"}>{submission.status}</Badge>
          <Badge tone="neutral">Problem #{submission.problemId}</Badge>
          <Badge tone="neutral">{submission.languageKey}</Badge>
        </div>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Problem" value={`#${submission.problemId}`} detail="Problem attached to this coding attempt" tone="cyan" />
        <StatCard label="Language" value={submission.languageKey} detail="Execution language used for this run" tone="violet" />
        <StatCard label="Runtime" value={submission.runtimeMs != null ? `${submission.runtimeMs} ms` : "Pending"} detail="Measured execution time for this submission" tone="emerald" />
        <StatCard label="Memory" value={submission.memoryKb != null ? `${submission.memoryKb} KB` : "Pending"} detail="Recorded memory consumption for this run" tone="amber" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Verdict summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{submission.status}</h2>
            </div>
            <p className="text-sm text-slate-400">Submitted {formatTimestamp(submission.createdAt)}</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Review this submission alongside your broader problem attempt history to see whether you are converging toward stable accepted outcomes.
          </p>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Recommended next action</p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {submission.status === "ACCEPTED" ? "Move to the next challenge" : "Review and retry the same problem"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {submission.status === "ACCEPTED"
              ? "You have a successful result here, so the best next move is usually to continue momentum with another guided step."
              : "Use the code and problem summary below to identify what failed, then iterate while the problem context is still fresh."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => navigate(`/problems/${submission.problemId}`)}>
              {submission.status === "ACCEPTED" ? "Open problem context" : "Retry problem"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/problems")}>
              Browse more problems
            </Button>
          </div>
        </Card>
      </div>

      {problemSummary ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Problem Attempts" value={problemSummary.totalAttempts} detail="Total attempts recorded on this problem" tone="cyan" />
          <StatCard label="Accepted Attempts" value={problemSummary.acceptedAttempts} detail="Successful outcomes across your history" tone="emerald" />
          <StatCard label="Best Runtime" value={problemSummary.bestRuntimeMs != null ? `${problemSummary.bestRuntimeMs} ms` : "Pending"} detail="Best measured runtime across attempts" tone="amber" />
          <StatCard label="Languages Used" value={problemSummary.languagesUsed?.length || 0} detail={problemSummary.languagesUsed?.join(", ") || "No language history available"} tone="violet" />
        </section>
      ) : null}

      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Source code</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm text-slate-200">
          <code>{submission.sourceCode}</code>
        </pre>
      </Card>
    </div>
  );
}
