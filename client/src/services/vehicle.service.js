import api from "../api/axios";

export const getVehicles = async () => {
  const response = await api.get("/vehicles");
  return response.data;
};

export const getVehicle = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await api.post(
    "/vehicles",
    vehicleData
  );
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.patch(
    `/vehicles/${id}`,
    vehicleData
  );
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(
    `/vehicles/${id}`
  );
  return response.data;
};