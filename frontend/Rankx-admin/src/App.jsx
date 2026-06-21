import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminShell from "./components/AdminShell";
import Card from "./components/ui/Card";
import LoadingSkeleton from "./components/ui/LoadingSkeleton";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./dashboard/Dashboard"));
const ManageQuizzes = lazy(() => import("./modules/quizzes/pages/ManageQuizzes"));
const CreateQuiz = lazy(() => import("./modules/quizzes/pages/CreateQuiz"));
const EditQuiz = lazy(() => import("./modules/quizzes/pages/EditQuiz"));
const QuizPreview = lazy(() => import("./modules/quizzes/pages/QuizPreview"));
const ManageQuestions = lazy(() => import("./modules/questions/pages/ManageQuestions"));
const CreateQuestion = lazy(() => import("./modules/questions/pages/CreateQuestion"));
const EditQuestion = lazy(() => import("./modules/questions/pages/EditQuestion"));
const StudyPlanList = lazy(() => import("./pages/StudyPlanList"));
const StudyPlanEditor = lazy(() => import("./pages/StudyPlanEditor"));
const StudyPlanItemsEditor = lazy(() => import("./pages/StudyPlanItemsEditor"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminKpiDashboard = lazy(() => import("./pages/AdminKpiDashboard"));
const ProblemAnalytics = lazy(() => import("./pages/ProblemAnalytics"));
const QuizAnalytics = lazy(() => import("./pages/QuizAnalytics"));
const QuestionAnalytics = lazy(() => import("./pages/QuestionAnalytics"));

function RouteLoader() {
  return (
    <div className="admin-shell flex items-center justify-center">
      <Card className="w-full max-w-3xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Loading</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Preparing the admin console
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Loading navigation context, management tools, and the data needed for the next admin workflow.
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
          <Route path="/login" element={<Login />} />

          <Route element={<AdminShell />}>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/analytics/kpis" element={<AdminKpiDashboard />} />
            <Route path="/admin/analytics/problems" element={<ProblemAnalytics />} />
            <Route path="/admin/analytics/quizzes" element={<QuizAnalytics />} />
            <Route path="/admin/analytics/questions" element={<QuestionAnalytics />} />

            <Route path="/quizzes" element={<ManageQuizzes />} />
            <Route path="/quizzes/create" element={<CreateQuiz />} />
            <Route path="/quizzes/:id/preview" element={<QuizPreview />} />
            <Route path="/quizzes/:id/edit" element={<EditQuiz />} />

            <Route path="/quizzes/:quizId/questions" element={<ManageQuestions />} />
            <Route path="/quizzes/:quizId/questions/create" element={<CreateQuestion />} />
            <Route path="/quizzes/:quizId/questions/:questionId/edit" element={<EditQuestion />} />

            <Route path="/admin/users" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/plans" element={<StudyPlanList />} />
            <Route path="/admin/plans/create" element={<StudyPlanEditor />} />
            <Route path="/admin/plans/:id/edit" element={<StudyPlanEditor />} />
            <Route path="/admin/plans/:id/items" element={<StudyPlanItemsEditor />} />
            <Route path="/admin/payments" element={<Navigate to="/admin/analytics/kpis" replace />} />
            <Route path="/admin/reports" element={<Navigate to="/admin/analytics/kpis" replace />} />
            <Route path="/admin/support" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
