import axiosInstance from "./axiosInstance";

export async function getDataRisikoList() {
  const response = await axiosInstance.get("/data-risiko");
  return response.data;
}

export async function getDataRisikoDetail(id) {
  const response = await axiosInstance.get(`/data-risiko/${id}`);
  return response.data;
}

export async function createDataRisiko(payload) {
  const response = await axiosInstance.post("/data-risiko", payload);
  return response.data;
}

export async function updateDataRisiko(id, payload) {
  const response = await axiosInstance.put(`/data-risiko/${id}`, payload);
  return response.data;
}

export async function deleteDataRisiko(id) {
  const response = await axiosInstance.delete(`/data-risiko/${id}`);
  return response.data;
}