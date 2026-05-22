import axiosInstance from "./axiosInstance";

export async function getIntervensiList() {
    const response = await axiosInstance.get("/intervensi");
    return response.data;
}

export async function getIntervensiDetail(id) {
    const response = await axiosInstance.get(`/intervensi/${id}`);
    return response.data;
}

export async function createIntervensi(payload) {
    const response = await axiosInstance.post("/intervensi", payload);
    return response.data;
}

export async function updateIntervensi(id, payload) {
    const response = await axiosInstance.put(`/intervensi/${id}`, payload);
    return response.data;
}

export async function deleteIntervensi(id) {
    const response = await axiosInstance.delete(`/intervensi/${id}`);
    return response.data;
}