import api from "./api";

export const getStudyPlansAdmin = async () =>
  (await api.get("/users/admin/study-plans")).data;

export const getStudyPlanAdmin = async (planId) =>
  (await api.get(`/users/admin/study-plans/${planId}`)).data;

export const createStudyPlanAdmin = async (payload) =>
  (await api.post("/users/admin/study-plans", payload)).data;

export const updateStudyPlanAdmin = async (planId, payload) =>
  (await api.put(`/users/admin/study-plans/${planId}`, payload)).data;

export const deactivateStudyPlanAdmin = async (planId) =>
  (await api.put(`/users/admin/study-plans/${planId}/deactivate`)).data;
