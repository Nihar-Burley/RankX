import api, { extractApiData } from "./api";

export const getMyProfile = async () => {
  const response = await api.get("/users/me");
  return extractApiData(response);
};

export const getMyPreferences = async () => {
  const response = await api.get("/users/me/preferences");
  return extractApiData(response);
};

export const updateMyPreferences = async (payload) => {
  const response = await api.put("/users/me/preferences", payload);
  return extractApiData(response);
};

export const getMyDashboardSummary = async () => {
  const response = await api.get("/users/me/dashboard-summary");
  return extractApiData(response);
};

export const getMyAnalytics = async () => {
  const response = await api.get("/users/me/analytics");
  return extractApiData(response);
};

export const normalizeRecommendation = (recommendation) => {
  if (!recommendation) {
    return null;
  }

  return {
    title: recommendation.title || "Next action",
    description: recommendation.description || "Continue your next best step in RankX.",
    route: recommendation.route || "/home",
    reason: recommendation.reason || "Personalized from your current activity",
    priority: recommendation.priority || "LOW",
    recommendationType: recommendation.recommendationType || "GENERAL",
  };
};

export const getStudyPlans = async () => {
  const response = await api.get("/users/study-plans");
  return extractApiData(response);
};

export const getStudyPlanDetail = async (studyPlanId) => {
  const response = await api.get(`/users/study-plans/${studyPlanId}`);
  return extractApiData(response);
};

export const enrollInStudyPlan = async (studyPlanId) => {
  const response = await api.post(`/users/study-plans/${studyPlanId}/enroll`);
  return extractApiData(response);
};

export const getMyStudyPlans = async () => {
  const response = await api.get("/users/me/study-plans");
  return extractApiData(response);
};

export const getStudyPlanProgress = async (studyPlanId) => {
  const response = await api.get(`/users/me/study-plans/${studyPlanId}/progress`);
  return extractApiData(response);
};

export const getMyProgressSummary = async () => {
  const response = await api.get("/users/me/progress-summary");
  return extractApiData(response);
};
