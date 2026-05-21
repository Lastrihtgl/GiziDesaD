import axiosInstance from "./axiosInstance";

export async function getDashboardSummary() {
  const response = await axiosInstance.get("/dashboard");
  return response.data;
}