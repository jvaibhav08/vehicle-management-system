import { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Car,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  X,
} from "lucide-react";

import { getAllPuc } from "../../services/puc.service";
import { useToast } from "../../context/ToastContext";

function PUC() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const statusFilter =
    searchParams.get("status");

  const [pucRecords, setPucRecords] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [recentlyViewedVehicleId, setRecentlyViewedVehicleId] =
    useState(() => sessionStorage.getItem("recentlyViewedPucVehicleId"));

  const recentlyViewedRowRef = useRef(null);

  // ======================================================
  // FETCH PUC RECORDS
  // ======================================================

  useEffect(() => {
    fetchPucRecords();
  }, []);

  // ======================================================
  // FETCH FUNCTION
  // ======================================================

  const fetchPucRecords = async () => {
    try {
      const response = await getAllPuc();

      if (response.success) {
        setPucRecords(
          response.data || []
        );
      } else {
        showToast(
          response.message ||
            "Failed to load PUC records",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while loading PUC records",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const openVehiclePuc = (vehicleId, destination) => {
    const selectedVehicleId = String(vehicleId);
    sessionStorage.setItem(
      "recentlyViewedPucVehicleId",
      selectedVehicleId
    );
    setRecentlyViewedVehicleId(selectedVehicleId);
    navigate(destination);
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleDateString("en-IN");
  };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyles = (status) => {
    switch (status) {
      case "valid":
        return "bg-emerald-50 text-emerald-600";

      case "expiring_soon":
        return "bg-amber-50 text-amber-600";

      case "expires_today":
        return "bg-orange-50 text-orange-600";

      case "expired":
        return "bg-red-50 text-red-500";

      case "no_puc":
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // ======================================================
  // STATUS LABEL
  // ======================================================

  const getStatusLabel = (record) => {
    switch (record.status) {
      case "valid":
        return "Valid";

      case "expiring_soon":
        return `Expires in ${record.daysRemaining} days`;

      case "expires_today":
        return "Expires Today";

      case "expired":
        return "Expired";

      case "no_puc":
      default:
        return "No PUC";
    }
  };

  // ======================================================
  // STATUS PRIORITY
  //
  // Expired + No PUC
  // Expiring Soon
  // Valid
  // ======================================================

  const getStatusPriority = (status) => {
    switch (status) {
      case "expired":
        return 0;

      case "no_puc":
        return 0;

      case "expires_today":
        return 1;

      case "expiring_soon":
        return 1;

      case "valid":
        return 2;

      default:
        return 3;
    }
  };

  // ======================================================
  // SORT + FILTER + SEARCH
  // ======================================================

  const filteredRecords = useMemo(() => {

    // --------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------

    let records = [...pucRecords];

    if (statusFilter) {

      records = records.filter(
        (record) => {

          // Dashboard's "expiring soon" category
          // includes policies expiring today.

          if (
            statusFilter ===
            "expiring_soon"
          ) {
            return (
              record.status ===
                "expiring_soon" ||
              record.status ===
                "expires_today"
            );
          }

          return (
            record.status ===
            statusFilter
          );
        }
      );
    }

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const search =
      searchTerm
        .trim()
        .toLowerCase();

    if (search) {

      records = records.filter(
        (record) => {

          return (
            record.vehicle_number
              ?.toLowerCase()
              .includes(search) ||
            record.vehicle_name
              ?.toLowerCase()
              .includes(search)
          );
        }
      );
    }

    // --------------------------------------------------
    // SORT
    //
    // Expired + No PUC
    //        ↓
    // Expiring Soon
    //        ↓
    // Valid
    // --------------------------------------------------

    records.sort((a, b) => {

      return (
        getStatusPriority(
          a.status
        ) -
        getStatusPriority(
          b.status
        )
      );

    });

    return records;

  }, [
    pucRecords,
    searchTerm,
    statusFilter,
  ]);

  useEffect(() => {
    if (
      !loading &&
      recentlyViewedVehicleId &&
      recentlyViewedRowRef.current
    ) {
      recentlyViewedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, recentlyViewedVehicleId, filteredRecords]);

  // ======================================================
  // CLEAR STATUS FILTER
  // ======================================================

  const clearStatusFilter = () => {
    setSearchParams({});
  };

  // ======================================================
  // FILTER LABEL
  // ======================================================

  const getFilterLabel = () => {

    switch (statusFilter) {

      case "expired":
        return "Expired";

      case "no_puc":
        return "No PUC";

      case "expiring_soon":
        return "Expiring Soon";

      case "valid":
        return "Valid";

      default:
        return "";
    }
  };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            PUC
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage pollution certificates for your vehicles.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/puc/add")
          }
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus size={17} />
          Add PUC
        </button>

      </div>

      {/* ==================================================
          ACTIVE FILTER
      ================================================== */}

      {statusFilter && (

        <div className="mb-4 flex items-center gap-2">

          <span className="text-sm text-gray-500">
            Filter:
          </span>

          <button
            type="button"
            onClick={clearStatusFilter}
            className={`group flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "valid"
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : statusFilter ===
                  "expiring_soon"
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                : statusFilter ===
                  "expired"
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {getFilterLabel()}

            <X
              size={14}
              className="transition group-hover:scale-110"
            />

          </button>

        </div>

      )}

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="mb-6 flex items-center rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">

        <Search
          size={19}
          className="text-gray-400"
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          placeholder="Search vehicles..."
          className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {loading ? (

          <div className="flex min-h-60 items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

              <p className="text-sm font-medium text-gray-500">
                Loading PUC records...
              </p>

            </div>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="flex min-h-60 flex-col items-center justify-center">

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Car size={24} />
            </div>

            <p className="font-semibold text-gray-700">
              No records found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {statusFilter
                ? `No vehicles with ${getFilterLabel().toLowerCase()} PUC.`
                : "Try searching with a different vehicle number or name."}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="border-b border-gray-100 bg-gray-50/70">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Vehicle
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    PUC Number
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Expiry Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  (record) => (

                    <tr
                      key={
                        record.vehicle_id
                      }
                      ref={
                        String(record.vehicle_id) ===
                        String(recentlyViewedVehicleId)
                          ? recentlyViewedRowRef
                          : null
                      }
                      className={`border-b border-gray-50 last:border-0 hover:bg-emerald-50/30 ${
                        String(record.vehicle_id) === String(recentlyViewedVehicleId)
                          ? "bg-emerald-50/50"
                          : ""
                      }`}
                    >

                      {/* Vehicle */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Car size={19} />
                          </div>

                          <div>

                            <p className="text-sm font-semibold text-gray-800">
                              {
                                record.vehicle_number
                              }
                            </p>

                            {String(record.vehicle_id) === String(recentlyViewedVehicleId) && (
                              <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Recently viewed
                              </span>
                            )}

                            <p className="text-xs text-gray-400">
                              {
                                record.vehicle_name ||
                                "—"
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PUC Number */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {
                          record.certificate_number ||
                          "—"
                        }
                      </td>

                      {/* Expiry Date */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(
                          record.expiry_date
                        )}
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                            record.status
                          )}`}
                        >
                          {getStatusLabel(
                            record
                          )}
                        </span>

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* Edit */}

                          {record.puc_id && (

                            <button
                              type="button"
                              onClick={() =>
                                openVehiclePuc(
                                  record.vehicle_id,
                                  `/puc/edit/${record.puc_id}`
                                )
                              }
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                          )}

                          {/* View Details */}

                          <button
                            type="button"
                            onClick={() =>
                              openVehiclePuc(
                                record.vehicle_id,
                                `/puc/details/${record.vehicle_id}`
                              )
                            }
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreVertical
                              size={17}
                            />
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
  );
}

export default PUC;
