import api from "../api/axios";

// Get all registered vehicles with their PUC information
export const getAllPuc = async () => {
  const response = await api.get("/puc");
  return response.data;
};

// Get PUC for a specific vehicle
export const getPucByVehicleId = async (vehicleId) => {
  const response = await api.get(`/puc/vehicle/${vehicleId}`);
  return response.data;
};

// Get a specific PUC by PUC ID
export const getPucById = async (pucId) => {
  const response = await api.get(`/puc/certificate/${pucId}`);
  return response.data;
};

// Add PUC / Renew PUC
export const addPuc = async (pucData) => {
  const response = await api.post("/puc", pucData);
  return response.data;
};

// Update PUC
export const updatePuc = async (pucId, pucData) => {
  const response = await api.put(`/puc/${pucId}`, pucData);
  return response.data;
};