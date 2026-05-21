import axiosInstance from "./axiosInstance";

export async function loginUser(payload) {
  const response = await axiosInstance.post("/login", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await axiosInstance.get("/me");
  return response.data;
}

export async function logoutUser() {
  const response = await axiosInstance.post("/logout");
  return response.data;
}