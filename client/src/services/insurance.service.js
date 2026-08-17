import api from "../api/axios";

// ======================================================
// GET ALL ACTIVE INSURANCE POLICIES
// ======================================================

export const getAllActiveInsurance = async () => {
  const response = await api.get("/insurance");

  return response.data;
};

// ======================================================
// GET ALL INSURANCE POLICIES BY VEHICLE
// Includes active + previous policies
// ======================================================

export const getInsuranceByVehicleId = async (vehicleId) => {
  const response = await api.get(
    `/insurance/${vehicleId}`
  );

  return response.data;
};

// ======================================================
// GET SINGLE INSURANCE POLICY BY ID
// ======================================================

export const getInsuranceById = async (insuranceId) => {
  const response = await api.get(
    `/insurance/policy/${insuranceId}`
  );

  return response.data;
};

// ======================================================
// ADD / RENEW INSURANCE
// ======================================================

export const addInsurance = async (insuranceData) => {
  const response = await api.post(
    "/insurance",
    insuranceData
  );

  return response.data;
};

// ======================================================
// UPDATE INSURANCE
// ======================================================

export const updateInsurance = async (
  insuranceId,
  insuranceData
) => {
  const response = await api.put(
    `/insurance/${insuranceId}`,
    insuranceData
  );

  return response.data;
};