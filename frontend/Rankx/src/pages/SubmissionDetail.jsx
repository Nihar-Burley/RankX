import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
          localStorage.removeItem("token");
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

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Coding Review
            </p>
            <h1 className="mt-3 text-4xl font-bold">
              Submission #{submissionId}
            </h1>
          </div>
          <button
            onClick={() => navigate("/submissions")}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Back to History
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            Loading submission details...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-200">
            {error}
          </div>
        ) : submission ? (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Problem</p>
                <p className="mt-2 text-2xl font-semibold">Problem #{submission.problemId}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Language</p>
                <p className="mt-2 text-2xl font-semibold">{submission.languageKey}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Runtime</p>
                <p className="mt-2 text-2xl font-semibold">
                  {submission.runtimeMs != null ? `${submission.runtimeMs} ms` : "Pending"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Memory</p>
                <p className="mt-2 text-2xl font-semibold">
                  {submission.memoryKb != null ? `${submission.memoryKb} KB` : "Pending"}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Verdict</p>
                  <p className="mt-2 text-2xl font-semibold">{submission.status}</p>
                </div>
                <p className="text-sm text-slate-400">
                  Submitted {formatTimestamp(submission.createdAt)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Review this submission alongside your broader problem attempt history to see whether you are converging toward stable accepted outcomes.
              </p>
            </section>

            {problemSummary ? (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Problem Attempts</p>
                  <p className="mt-2 text-2xl font-semibold">{problemSummary.totalAttempts}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Accepted Attempts</p>
                  <p className="mt-2 text-2xl font-semibold">{problemSummary.acceptedAttempts}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Best Runtime</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {problemSummary.bestRuntimeMs != null ? `${problemSummary.bestRuntimeMs} ms` : "Pending"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">Languages Used</p>
                  <p className="mt-2 text-base font-semibold">{problemSummary.languagesUsed?.join(", ") || "N/A"}</p>
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Source Code
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm text-slate-200">
                <code>{submission.sourceCode}</code>
              </pre>
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            Submission details are unavailable right now.
          </div>
        )}
      </div>
    </div>
  );
}
