import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Car,
  FileCheck,
  CalendarDays,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { getAllPuc } from "../../services/puc.service";

function PucDetails() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // FETCH VEHICLE + PUC DETAILS
  // ======================================================

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getAllPuc();

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to load PUC details"
          );
        }

        const selectedVehicle =
          response.data.find(
            (item) =>
              String(item.vehicle_id) ===
              String(vehicleId)
          );

        if (!selectedVehicle) {
          throw new Error(
            "Vehicle not found"
          );
        }

        setVehicle(selectedVehicle);

      } catch (error) {
        console.error(error);

        showToast(
          error.response?.data?.message ||
          error.message ||
            "Failed to load PUC details",
          "error"
        );

        navigate("/puc");

      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

  }, [
    vehicleId,
    navigate,
    showToast,
  ]);

  // ======================================================
  // ADD PUC
  //
  // Pass the current vehicle ID so AddPuc can:
  //
  // 1. Automatically select the vehicle
  // 2. Lock the vehicle field
  // 3. Allow only PUC information to be entered
  // ======================================================

  const handleAddPuc = () => {

    if (!vehicle?.vehicle_id) {
      showToast(
        "Vehicle information is unavailable.",
        "error"
      );

      return;
    }

    navigate(
      `/puc/add?vehicleId=${vehicle.vehicle_id}`
    );
  };

  // ======================================================
  // EDIT PUC
  // ======================================================

  const handleEditPuc = () => {

    if (!vehicle?.puc_id) {
      return;
    }

    navigate(
      `/puc/edit/${vehicle.puc_id}`
    );
  };

  // ======================================================
  // STATUS UI
  // ======================================================

  const getStatusStyle = () => {

    if (
      !vehicle ||
      !vehicle.expiry_date
    ) {
      return {
        wrapper:
          "bg-gray-100 text-gray-500",
        label: "No PUC",
      };
    }

    if (
      vehicle.status === "expired"
    ) {
      return {
        wrapper:
          "bg-red-50 text-red-600",
        label: "Expired",
      };
    }

    if (
      vehicle.status ===
      "expires_today"
    ) {
      return {
        wrapper:
          "bg-orange-50 text-orange-600",
        label: "Expires Today",
      };
    }

    if (
      vehicle.status ===
      "expiring_soon"
    ) {
      return {
        wrapper:
          "bg-amber-50 text-amber-600",
        label:
          `Expires in ${vehicle.daysRemaining} days`,
      };
    }

    return {
      wrapper:
        "bg-emerald-50 text-emerald-600",
      label: "Valid",
    };
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading PUC details...
          </p>

        </div>

      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  const hasPuc =
    Boolean(vehicle.puc_id);

  const status =
    getStatusStyle();

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() =>
              navigate("/puc")
            }
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <ArrowLeft size={20} />
          </button>

          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              PUC Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View pollution certificate information.
            </p>

          </div>

        </div>

        {/* ==================================================
            HEADER ACTION
        ================================================== */}

        {hasPuc ? (

          <button
            type="button"
            onClick={handleEditPuc}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
          >
            <Pencil size={17} />
            Edit PUC
          </button>

        ) : (

          <button
            type="button"
            onClick={handleAddPuc}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
          >
            <Plus size={17} />
            Add PUC
          </button>

        )}

      </div>

      {/* ==================================================
          MAIN CARD
      ================================================== */}

      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* ==================================================
            CARD HEADER
        ================================================== */}

        <div className="flex items-center gap-4 border-b border-gray-100 p-6 lg:p-8">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileCheck size={28} />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-gray-800">
              Pollution Certificate
            </h2>

            <p className="text-sm text-gray-400">
              {hasPuc
                ? "Certificate details and current validity."
                : "No pollution certificate has been added for this vehicle."}
            </p>

          </div>

        </div>

        {/* ==================================================
            DETAILS
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:p-8">

          {/* ==================================================
              VEHICLE
          ================================================== */}

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">

            <div className="mb-3 flex items-center gap-2">

              <Car
                size={18}
                className="text-emerald-600"
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Vehicle
              </p>

            </div>

            <p className="text-base font-semibold text-gray-800">
              {vehicle.vehicle_number ||
                "—"}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {vehicle.vehicle_name ||
                "Unnamed Vehicle"}
            </p>

          </div>

          {/* ==================================================
              PUC NUMBER
          ================================================== */}

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">

            <div className="mb-3 flex items-center gap-2">

              <FileCheck
                size={18}
                className="text-emerald-600"
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                PUC Certificate Number
              </p>

            </div>

            <p className="text-base font-semibold text-gray-800">
              {vehicle.certificate_number ||
                "—"}
            </p>

          </div>

          {/* ==================================================
              EXPIRY DATE
          ================================================== */}

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">

            <div className="mb-3 flex items-center gap-2">

              <CalendarDays
                size={18}
                className="text-emerald-600"
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Expiry Date
              </p>

            </div>

            <p className="text-base font-semibold text-gray-800">
              {vehicle.expiry_date
                ? new Date(
                    vehicle.expiry_date
                  ).toLocaleDateString(
                    "en-IN"
                  )
                : "—"}
            </p>

          </div>

          {/* ==================================================
              STATUS
          ================================================== */}

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">

            <div className="mb-3 flex items-center gap-2">

              <ShieldCheck
                size={18}
                className="text-emerald-600"
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Current Status
              </p>

            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${status.wrapper}`}
            >
              {status.label}
            </span>

            {/* Valid */}

            {vehicle.status ===
              "valid" && (
              <p className="mt-2 text-xs text-gray-400">
                {
                  vehicle.daysRemaining
                }{" "}
                days remaining
              </p>
            )}

            {/* Expiring Soon */}

            {vehicle.status ===
              "expiring_soon" && (
              <p className="mt-2 text-xs text-amber-500">
                Renewal recommended soon.
              </p>
            )}

            {/* Expires Today */}

            {vehicle.status ===
              "expires_today" && (
              <p className="mt-2 text-xs text-orange-500">
                This certificate expires today.
              </p>
            )}

            {/* Expired */}

            {vehicle.status ===
              "expired" && (
              <p className="mt-2 text-xs text-red-500">
                This certificate has expired.
              </p>
            )}

            {/* No PUC */}

            {!hasPuc && (
              <p className="mt-2 text-xs text-gray-400">
                Add a PUC certificate to
                start tracking its validity.
              </p>
            )}

          </div>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-6 lg:p-8">

          <button
            type="button"
            onClick={() =>
              navigate("/puc")
            }
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to PUC
          </button>

          {hasPuc ? (

            <button
              type="button"
              onClick={handleEditPuc}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
            >
              <Pencil size={17} />
              Edit PUC
            </button>

          ) : (

            <button
              type="button"
              onClick={handleAddPuc}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus size={17} />
              Add PUC
            </button>

          )}

        </div>

      </div>

    </div>
  );
}

export default PucDetails;
