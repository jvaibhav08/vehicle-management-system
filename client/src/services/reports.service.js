import api from "../api/axios";

export const getVehicleReport = async () => {
  const response = await api.get("/reports/vehicles");

  return response.data;
};