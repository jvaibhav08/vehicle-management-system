import { useToast } from "../../context/ToastContext";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Car,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  getVehicles,
  deleteVehicle,
} from "../../services/vehicle.service";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ======================================================
  // RC FILTER FROM DASHBOARD
  // ======================================================

  const rcStatusFilter = searchParams.get("rc_status");

  // ======================================================
  // FETCH VEHICLES
  // ======================================================

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await getVehicles();

      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Failed to load vehicles",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DELETE VEHICLE
  // ======================================================

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);

      const response = await deleteVehicle(
        deleteTarget.id
      );

      if (response.success) {
        setVehicles((currentVehicles) =>
          currentVehicles.filter(
            (vehicle) =>
              vehicle.id !== deleteTarget.id
          )
        );

        setDeleteTarget(null);

        showToast(
          "Vehicle deleted successfully",
          "success"
        );
      } else {
        showToast(
          response.message ||
            "Failed to delete vehicle",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while deleting the vehicle",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ======================================================
  // FILTER + SORT VEHICLES
  // ======================================================

  const displayedVehicles = [...vehicles]
    .filter((vehicle) => {
      if (!rcStatusFilter) {
        return true;
      }

      return vehicle.rc_status === rcStatusFilter;
    })
    .sort((a, b) => {
      // Pending vehicles always come first.
      if (
        a.rc_status === "Pending" &&
        b.rc_status !== "Pending"
      ) {
        return -1;
      }

      if (
        a.rc_status !== "Pending" &&
        b.rc_status === "Pending"
      ) {
        return 1;
      }

      return 0;
    });

  // ======================================================
  // CLEAR RC FILTER
  // ======================================================

  const clearRcFilter = () => {
    searchParams.delete("rc_status");

    setSearchParams(searchParams);
  };

  return (
    <>
      {/* ==================================================
          DELETE CONFIRMATION MODAL
      ================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* Icon */}

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Trash2 size={22} />
            </div>

            {/* Content */}

            <h2 className="text-lg font-semibold text-gray-800">
              Delete Vehicle?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteTarget.vehicle_number}
              </span>
              ? This action cannot be undone.
            </p>

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={isDeleting}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Vehicle"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          MAIN PAGE
      ================================================== */}

      <div className="p-6 lg:p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h1 className="text-2xl font-bold text-gray-800">
              Vehicles
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage all vehicles in your fleet.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/vehicles/add")
            }
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
          >
            <Plus size={17} />
            Add Vehicle
          </button>

        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mb-4 flex items-center rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">

          <Search
            size={19}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search vehicles..."
            className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />

        </div>

        {/* ==================================================
            ACTIVE RC FILTER
        ================================================== */}

        {rcStatusFilter && (
          <div className="mb-6 flex items-center gap-2">

            <span className="text-sm text-gray-500">
              Showing:
            </span>

            <button
              type="button"
              onClick={clearRcFilter}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                rcStatusFilter === "Pending"
                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              RC {rcStatusFilter}

              <X size={13} />

            </button>

          </div>
        )}

        {/* ==================================================
            VEHICLES TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {loading ? (

            /* Loading */

            <div className="flex min-h-60 items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

                <p className="text-sm font-medium text-gray-500">
                  Loading vehicles...
                </p>

              </div>

            </div>

          ) : displayedVehicles.length === 0 ? (

            /* Empty State */

            <div className="flex min-h-60 flex-col items-center justify-center">

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Car size={24} />
              </div>

              <p className="font-semibold text-gray-700">
                No vehicles found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {rcStatusFilter
                  ? `No vehicles with RC status "${rcStatusFilter}".`
                  : "Add your first vehicle to get started."}
              </p>

            </div>

          ) : (

            /* Table */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead>

                  <tr className="border-b border-gray-100 bg-gray-50/70">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Registration Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      RC Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {displayedVehicles.map(
                    (vehicle) => (

                      <tr
                        key={vehicle.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-emerald-50/30"
                      >

                        {/* Vehicle */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <Car size={19} />
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-gray-800">
                                {vehicle.vehicle_number}
                              </p>

                              <p className="text-xs text-gray-400">
                                {vehicle.vehicle_name ||
                                  "—"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Vehicle Type */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {vehicle.vehicle_type || "—"}
                        </td>

                        {/* Registration Date */}

                        <td className="px-6 py-4 text-sm text-gray-600">

                          {vehicle.registration_date
                            ? new Date(
                                vehicle.registration_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}

                        </td>

                        {/* RC Status */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              vehicle.rc_status ===
                              "Received"
                                ? "bg-emerald-50 text-emerald-600"
                                : vehicle.rc_status ===
                                  "Pending"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {vehicle.rc_status ||
                              "Not Available"}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-4">

                          <div className="flex items-center justify-end gap-2">

                            {/* Edit */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/vehicles/edit/${vehicle.id}`
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Pencil size={17} />
                            </button>

                            {/* Delete */}

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  vehicle
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={17} />
                            </button>

                            {/* More */}

                            <button
                              type="button"
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                              <MoreVertical size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </>
  );
}

export default Vehicles;