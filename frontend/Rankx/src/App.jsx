import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import UserShell from "./components/UserShell";
import Card from "./components/ui/Card";
import LoadingSkeleton from "./components/ui/LoadingSkeleton";

const ProblemList = lazy(() => import("./pages/ProblemList"));
const ProblemDetail = lazy(() => import("./pages/ProblemDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Home = lazy(() => import("./pages/Home"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const StudyPlans = lazy(() => import("./pages/StudyPlans"));
const StudyPlanDetail = lazy(() => import("./pages/StudyPlanDetail"));
const MyProgress = lazy(() => import("./pages/MyProgress"));
const SubmissionHistory = lazy(() => import("./pages/SubmissionHistory"));
const SubmissionDetail = lazy(() => import("./pages/SubmissionDetail"));
const QuizList = lazy(() => import("./pages/quiz/QuizList"));
const QuizDetails = lazy(() => import("./pages/quiz/QuizDetails"));
const QuizAttempt = lazy(() => import("./pages/quiz/QuizAttempt"));
const QuizResult = lazy(() => import("./pages/quiz/QuizResult"));
const QuizHistory = lazy(() => import("./pages/quiz/QuizHistory"));
const QuizReview = lazy(() => import("./pages/quiz/QuizReview"));
const Account = lazy(() => import("./pages/Account"));

function RouteLoader() {
  return (
    <div className="app-shell flex items-center justify-center">
      <Card className="w-full max-w-3xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Loading</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Preparing your workspace
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Pulling in the next screen, navigation context, and the data you need so the page feels ready when it opens.
            </p>
            <LoadingSkeleton lines={4} className="mt-6" />
          </div>
          <Card variant="soft" className="min-h-[240px]">
            <LoadingSkeleton lines={6} />
          </Card>
        </div>
      </Card>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<UserShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/study-plans" element={<StudyPlans />} />
            <Route path="/study-plans/:id" element={<StudyPlanDetail />} />
            <Route path="/my-progress" element={<MyProgress />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/submissions" element={<SubmissionHistory />} />
            <Route path="/submissions/:submissionId" element={<SubmissionDetail />} />
            <Route path="/quiz" element={<QuizList />} />
            <Route path="/quiz/history" element={<QuizHistory />} />
            <Route path="/quiz/:quizId" element={<QuizDetails />} />
            <Route path="/quiz/result" element={<QuizResult />} />
            <Route path="/quiz/review/:attemptId" element={<QuizReview />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Navigate to="/account" replace />} />
            <Route path="/billing" element={<Navigate to="/account" replace />} />
            <Route path="/support" element={<Navigate to="/account" replace />} />
          </Route>

          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/quiz/:quizId/attempt" element={<QuizAttempt />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


export default App;
