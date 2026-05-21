import axiosInstance from "./axiosInstance";

export async function getWilayahList() {
  const response = await axiosInstance.get("/wilayah");
  return response.data;
}

export async function getWilayahDetail(id) {
  const response = await axiosInstance.get(`/wilayah/${id}`);
  return response.data;
}

export async function createWilayah(payload) {
  const response = await axiosInstance.post("/wilayah", payload);
  return response.data;
}

export async function updateWilayah(id, payload) {
  const response = await axiosInstance.put(`/wilayah/${id}`, payload);
  return response.data;
}

export async function deleteWilayah(id) {
  const response = await axiosInstance.delete(`/wilayah/${id}`);
  return response.data;
}