import axiosInstance from "./axiosInstance";

export async function getPanganLokalList() {
  const response = await axiosInstance.get("/pangan-lokal");
  return response.data;
}

export async function getPanganLokalDetail(id) {
  const response = await axiosInstance.get(`/pangan-lokal/${id}`);
  return response.data;
}

export async function createPanganLokal(payload) {
  const response = await axiosInstance.post("/pangan-lokal", payload);
  return response.data;
}

export async function updatePanganLokal(id, payload) {
  const response = await axiosInstance.put(`/pangan-lokal/${id}`, payload);
  return response.data;
}

export async function deletePanganLokal(id) {
  const response = await axiosInstance.delete(`/pangan-lokal/${id}`);
  return response.data;
}