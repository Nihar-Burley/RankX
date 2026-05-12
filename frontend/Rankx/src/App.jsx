import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import UserShell from "./components/UserShell";

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
const Settings = lazy(() => import("./pages/Settings"));
const Billing = lazy(() => import("./pages/Billing"));
const Support = lazy(() => import("./pages/Support"));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-300">
      Loading page...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landing" element={<LandingPage />} />

          <Route element={<UserShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/support" element={<Support />} />
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
