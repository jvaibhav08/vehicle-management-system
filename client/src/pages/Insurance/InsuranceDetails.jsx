import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Car,
  ShieldCheck,
  History,
  CalendarDays,
  FileText,
  Building2,
  Pencil,
  Plus,
} from "lucide-react";

import { getInsuranceByVehicleId } from "../../services/insurance.service";
import { getVehicles } from "../../services/vehicle.service";
import { useToast } from "../../context/ToastContext";

function InsuranceDetails() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState(null);

  const [activePolicies, setActivePolicies] = useState([]);
  const [previousPolicies, setPreviousPolicies] = useState([]);

  const [loading, setLoading] = useState(true);

  // ======================================================
  // FETCH VEHICLE + INSURANCE DETAILS
  // ======================================================

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        const [vehicleResponse, insuranceResponse] =
          await Promise.all([
            getVehicles(),
            getInsuranceByVehicleId(vehicleId),
          ]);

        // --------------------------------------------------
        // VEHICLE
        // --------------------------------------------------

        if (vehicleResponse.success) {
          const currentVehicle =
            vehicleResponse.data.find(
              (item) =>
                Number(item.id) === Number(vehicleId)
            );

          setVehicle(currentVehicle || null);
        }

        // --------------------------------------------------
        // INSURANCE
        // --------------------------------------------------

        if (insuranceResponse.success) {
          setActivePolicies(
            insuranceResponse.data?.active || []
          );

          setPreviousPolicies(
            insuranceResponse.data?.previous || []
          );
        } else {
          showToast(
            insuranceResponse.message ||
              "Failed to load insurance details",
            "error"
          );
        }
      } catch (error) {
        console.error(error);

        showToast(
          error.response?.data?.message ||
            "Something went wrong while loading insurance details",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchDetails();
    }
  }, [vehicleId]);

  // ======================================================
  // ADD INSURANCE
  // ======================================================

  const handleAddInsurance = () => {
    if (!vehicleId) {
      showToast(
        "Vehicle information is missing.",
        "error"
      );
      return;
    }

    const selectedVehicleId = String(vehicleId);

    navigate(
      `/insurance/add?vehicleId=${encodeURIComponent(
        selectedVehicleId
      )}`,
      {
        state: {
          vehicleId: selectedVehicleId,
          vehicle: vehicle || null,
        },
      }
    );
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN");
  };

  // ======================================================
  // FORMAT INSURANCE TYPE
  // ======================================================

  const getInsuranceTypeLabel = (type) => {
    switch (type) {
      case "comprehensive":
        return "Comprehensive";

      case "own_damage":
        return "Own Damage";

      case "third_party":
        return "Third Party";

      default:
        return "—";
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading insurance details...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex items-center gap-4">

        <button
          type="button"
          onClick={() => navigate("/insurance")}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Insurance Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View all insurance policies for this vehicle.
          </p>
        </div>

        {/* ADD INSURANCE */}

        <button
          type="button"
          onClick={handleAddInsurance}
          className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus size={17} />
          Add Insurance
        </button>

      </div>

      {/* ==================================================
          VEHICLE CARD
      ================================================== */}

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Car size={27} />
          </div>

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Vehicle
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-800">
              {vehicle?.vehicle_number || "—"}
            </h2>

            <p className="text-sm text-gray-500">
              {vehicle?.vehicle_name || "Unnamed Vehicle"}
            </p>

          </div>

        </div>

      </div>

      {/* ==================================================
          ACTIVE POLICIES
      ================================================== */}

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Active Insurance
            </h2>

            <p className="text-sm text-gray-400">
              Currently active insurance policies.
            </p>
          </div>

        </div>

        {activePolicies.length === 0 ? (

          <div className="flex min-h-32 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200">

            <p className="text-sm text-gray-400">
              No active insurance policies.
            </p>

            <button
              type="button"
              onClick={handleAddInsurance}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus size={17} />
              Add Insurance
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {activePolicies.map((policy) => (

              <div
                key={policy.id}
                className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5"
              >

                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>

                    <div className="flex items-center gap-2">

                      <Building2
                        size={18}
                        className="text-emerald-600"
                      />

                      <h3 className="font-semibold text-gray-800">
                        {policy.insurance_company || "—"}
                      </h3>

                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {getInsuranceTypeLabel(
                        policy.insurance_type
                      )}
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Active
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/insurance/edit/${policy.id}`
                        )
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Pencil size={17} />
                    </button>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-emerald-100 pt-4 sm:grid-cols-2">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500">
                      <FileText size={17} />
                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Policy Number
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {policy.policy_number || "—"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500">
                      <CalendarDays size={17} />
                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Expiry Date
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(policy.expiry_date)}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ==================================================
          PREVIOUS INSURANCE
      ================================================== */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            <History size={22} />
          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              Previous Insurance
            </h2>

            <p className="text-sm text-gray-400">
              Previous policies retained for this vehicle.
            </p>

          </div>

        </div>

        {previousPolicies.length === 0 ? (

          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-gray-200">

            <p className="text-sm text-gray-400">
              No previous insurance policies.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {previousPolicies.map((policy) => (

              <div
                key={policy.id}
                className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 md:grid-cols-4"
              >

                <div>

                  <p className="text-xs text-gray-400">
                    Insurance Company
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {policy.insurance_company || "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-400">
                    Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {getInsuranceTypeLabel(
                      policy.insurance_type
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-400">
                    Policy Number
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {policy.policy_number || "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-400">
                    Expiry Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {formatDate(policy.expiry_date)}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default InsuranceDetails;