import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { getVehicles } from "../../services/vehicle.service";
import { addInsurance } from "../../services/insurance.service";
import VehicleSelect from "../../components/common/VehicleSelect";
import { useToast } from "../../context/ToastContext";

function AddInsurance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const vehicleIdFromUrl =
    searchParams.get("vehicleId");

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] =
    useState(null);

  const [loadingVehicles, setLoadingVehicles] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({
    vehicle_id: "",
    insurance_company: "",
    policy_number: "",
    expiry_date: "",
    covers_own_damage: false,
    covers_third_party: false,
  });

  const [errors, setErrors] = useState({});

  // ======================================================
  // FETCH VEHICLES
  // ======================================================

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);

        const response = await getVehicles();

        if (!response.success) {
          showToast(
            response.message ||
              "Failed to load vehicles",
            "error"
          );

          return;
        }

        const vehicleList =
          response.data || [];

        setVehicles(vehicleList);

        // --------------------------------------------------
        // VEHICLE-SPECIFIC ADD INSURANCE
        //
        // If vehicleId exists in URL, find that vehicle
        // and lock it to this form.
        // --------------------------------------------------

        if (vehicleIdFromUrl) {
          const currentVehicle =
            vehicleList.find(
              (vehicle) =>
                Number(vehicle.id) ===
                Number(vehicleIdFromUrl)
            );

          if (!currentVehicle) {
            showToast(
              "Selected vehicle could not be found.",
              "error"
            );

            return;
          }

          setSelectedVehicle(
            currentVehicle
          );

          setFormData((previous) => ({
            ...previous,
            vehicle_id: String(
              currentVehicle.id
            ),
          }));
        }
      } catch (error) {
        console.error(error);

        showToast(
          error.response?.data?.message ||
            "Failed to load vehicles",
          "error"
        );
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [vehicleIdFromUrl]);

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ======================================================
  // HANDLE COVERAGE CHANGE
  // ======================================================

  const handleCoverageChange = (name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setErrors((previous) => ({
      ...previous,
      coverage: "",
    }));
  };

  // ======================================================
  // HANDLE SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // --------------------------------------------------
    // VEHICLE
    // --------------------------------------------------

    if (!formData.vehicle_id) {
      newErrors.vehicle_id =
        "Vehicle is required";
    }

    // --------------------------------------------------
    // INSURANCE COMPANY
    // --------------------------------------------------

    if (
      !formData.insurance_company.trim()
    ) {
      newErrors.insurance_company =
        "Insurance company is required";
    }

    // --------------------------------------------------
    // POLICY NUMBER
    // --------------------------------------------------

    if (
      !formData.policy_number.trim()
    ) {
      newErrors.policy_number =
        "Policy number is required";
    }

    // --------------------------------------------------
    // EXPIRY DATE
    // --------------------------------------------------

    if (!formData.expiry_date) {
      newErrors.expiry_date =
        "Expiry date is required";
    }

    // --------------------------------------------------
    // COVERAGE
    // --------------------------------------------------

    if (
      !formData.covers_own_damage &&
      !formData.covers_third_party
    ) {
      newErrors.coverage =
        "Select at least one coverage type";
    }

    // --------------------------------------------------
    // VALIDATION RESULT
    // --------------------------------------------------

    if (
      Object.keys(newErrors).length > 0
    ) {
      setErrors(newErrors);

      showToast(
        "Please check the form and fill all required fields.",
        "error"
      );

      return;
    }

    // ==================================================
    // SUBMIT
    // ==================================================

    try {
      setIsSubmitting(true);

      const response =
        await addInsurance(formData);

      if (response.success) {
        showToast(
          response.message ||
            "Insurance added successfully",
          "success"
        );

        setTimeout(() => {
          navigate("/insurance");
        }, 1000);
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while adding insurance",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loadingVehicles) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">

          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading vehicle information...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex items-center gap-4">

        <button
          type="button"
          onClick={() =>
            navigate("/insurance")
          }
          disabled={isSubmitting}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={20} />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Add Insurance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add an insurance policy to your vehicle.
          </p>

        </div>

      </div>

      {/* ==================================================
          FORM CARD
      ================================================== */}

      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">

        {/* FORM HEADER */}

        <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={24} />
          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              Insurance Information
            </h2>

            <p className="text-sm text-gray-400">
              Enter the insurance policy details.
            </p>

          </div>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* ==================================================
                VEHICLE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Vehicle
              </label>

              {vehicleIdFromUrl ? (

                /* ------------------------------------------------
                   LOCKED VEHICLE
                   ------------------------------------------------ */

                <div className="flex h-[58px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={18} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-gray-800">
                      {selectedVehicle?.vehicle_number ||
                        "—"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {selectedVehicle?.vehicle_name ||
                        "Unnamed Vehicle"}
                    </p>

                  </div>

                  <Lock
                    size={16}
                    className="shrink-0 text-gray-400"
                  />

                </div>

              ) : (

                /* ------------------------------------------------
                   NORMAL VEHICLE SELECT
                   ------------------------------------------------ */

                <VehicleSelect
                  vehicles={vehicles}
                  value={formData.vehicle_id}
                  onChange={(vehicleId) => {

                    setFormData(
                      (previous) => ({
                        ...previous,
                        vehicle_id:
                          vehicleId,
                      })
                    );

                    setErrors(
                      (previous) => ({
                        ...previous,
                        vehicle_id:
                          "",
                      })
                    );
                  }}
                />

              )}

              {vehicleIdFromUrl && (
                <p className="mt-2 text-xs text-gray-400">
                  Vehicle is locked because you opened Add
                  Insurance from this vehicle's details.
                </p>
              )}

              {errors.vehicle_id && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.vehicle_id}
                </p>
              )}

            </div>

            {/* ==================================================
                INSURANCE COMPANY
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Insurance Company
              </label>

              <input
                type="text"
                name="insurance_company"
                value={
                  formData.insurance_company
                }
                onChange={handleChange}
                placeholder="e.g. SBI General"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  errors.insurance_company
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.insurance_company && (
                <p className="mt-2 text-xs text-red-500">
                  {
                    errors.insurance_company
                  }
                </p>
              )}

            </div>

            {/* ==================================================
                POLICY NUMBER
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Policy Number
              </label>

              <input
                type="text"
                name="policy_number"
                value={
                  formData.policy_number
                }
                onChange={handleChange}
                placeholder="e.g. POL-2026-123456"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  errors.policy_number
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.policy_number && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.policy_number}
                </p>
              )}

            </div>

            {/* ==================================================
                EXPIRY DATE
            ================================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Expiry Date
              </label>

              <input
                type="date"
                name="expiry_date"
                value={
                  formData.expiry_date
                }
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none transition ${
                  errors.expiry_date
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.expiry_date && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.expiry_date}
                </p>
              )}

            </div>

          </div>

          {/* ==================================================
              COVERAGE
          ================================================== */}

          <div>

            <label className="mb-3 block text-sm font-medium text-gray-700">
              Coverage
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* OWN DAMAGE */}

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  formData.covers_own_damage
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >

                <input
                  type="checkbox"
                  checked={
                    formData.covers_own_damage
                  }
                  onChange={() =>
                    handleCoverageChange(
                      "covers_own_damage"
                    )
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 cursor-pointer accent-emerald-600"
                />

                <div>

                  <p className="text-sm font-medium text-gray-700">
                    Own Damage
                  </p>

                  <p className="text-xs text-gray-400">
                    Damage to your own vehicle
                  </p>

                </div>

              </label>

              {/* THIRD PARTY */}

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  formData.covers_third_party
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >

                <input
                  type="checkbox"
                  checked={
                    formData.covers_third_party
                  }
                  onChange={() =>
                    handleCoverageChange(
                      "covers_third_party"
                    )
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 cursor-pointer accent-emerald-600"
                />

                <div>

                  <p className="text-sm font-medium text-gray-700">
                    Third Party
                  </p>

                  <p className="text-xs text-gray-400">
                    Third party liability coverage
                  </p>

                </div>

              </label>

            </div>

            {errors.coverage && (
              <p className="mt-2 text-xs text-red-500">
                {errors.coverage}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
              Note: Select both for Comprehensive coverage.
            </p>

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">

            <button
              type="button"
              onClick={() =>
                navigate("/insurance")
              }
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : "Save Insurance"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddInsurance;