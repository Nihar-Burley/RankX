import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminShell from "./components/AdminShell";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./dashboard/Dashboard"));
const ManageQuizzes = lazy(() => import("./modules/quizzes/pages/ManageQuizzes"));
const CreateQuiz = lazy(() => import("./modules/quizzes/pages/CreateQuiz"));
const EditQuiz = lazy(() => import("./modules/quizzes/pages/EditQuiz"));
const QuizPreview = lazy(() => import("./modules/quizzes/pages/QuizPreview"));
const ManageQuestions = lazy(() => import("./modules/questions/pages/ManageQuestions"));
const CreateQuestion = lazy(() => import("./modules/questions/pages/CreateQuestion"));
const EditQuestion = lazy(() => import("./modules/questions/pages/EditQuestion"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const StudyPlanList = lazy(() => import("./pages/StudyPlanList"));
const StudyPlanEditor = lazy(() => import("./pages/StudyPlanEditor"));
const StudyPlanItemsEditor = lazy(() => import("./pages/StudyPlanItemsEditor"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminKpiDashboard = lazy(() => import("./pages/AdminKpiDashboard"));
const ProblemAnalytics = lazy(() => import("./pages/ProblemAnalytics"));
const QuizAnalytics = lazy(() => import("./pages/QuizAnalytics"));
const QuestionAnalytics = lazy(() => import("./pages/QuestionAnalytics"));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-300">
      Loading admin page...
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

            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/plans" element={<StudyPlanList />} />
            <Route path="/admin/plans/create" element={<StudyPlanEditor />} />
            <Route path="/admin/plans/:id/edit" element={<StudyPlanEditor />} />
            <Route path="/admin/plans/:id/items" element={<StudyPlanItemsEditor />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
