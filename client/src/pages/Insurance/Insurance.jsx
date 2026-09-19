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

import { getAllActiveInsurance } from "../../services/insurance.service";
import { getVehicles } from "../../services/vehicle.service";
import { useToast } from "../../context/ToastContext";

function Insurance() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const statusFilter =
    searchParams.get("status");

  const [insuranceRecords, setInsuranceRecords] =
    useState([]);

  const [vehicles, setVehicles] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [recentlyViewedVehicleId, setRecentlyViewedVehicleId] =
    useState(() => sessionStorage.getItem("recentlyViewedInsuranceVehicleId"));

  const recentlyViewedRowRef = useRef(null);

  // ======================================================
  // FETCH VEHICLES + ACTIVE INSURANCE
  // ======================================================

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      const [
        vehicleResponse,
        insuranceResponse,
      ] = await Promise.all([
        getVehicles(),
        getAllActiveInsurance(),
      ]);

      // --------------------------------------------------
      // VEHICLES
      // --------------------------------------------------

      if (vehicleResponse.success) {
        setVehicles(
          vehicleResponse.data || []
        );
      } else {
        showToast(
          vehicleResponse.message ||
            "Failed to load vehicles",
          "error"
        );
      }

      // --------------------------------------------------
      // ACTIVE INSURANCE
      // --------------------------------------------------

      if (insuranceResponse.success) {
        setInsuranceRecords(
          insuranceResponse.data || []
        );
      } else {
        showToast(
          insuranceResponse.message ||
            "Failed to load insurance records",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while loading insurance data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const openVehicleInsurance = (vehicleId, destination) => {
    const selectedVehicleId = String(vehicleId);
    sessionStorage.setItem(
      "recentlyViewedInsuranceVehicleId",
      selectedVehicleId
    );
    setRecentlyViewedVehicleId(selectedVehicleId);
    navigate(destination);
  };

  // ======================================================
  // GROUP ALL VEHICLES
  //
  // Start with ALL vehicles so vehicles without insurance
  // are also displayed.
  // ======================================================

  const groupedVehicles = useMemo(() => {
    const groups = {};

    // --------------------------------------------------
    // ADD ALL VEHICLES FIRST
    // --------------------------------------------------

    vehicles.forEach((vehicle) => {
      groups[vehicle.id] = {
        vehicle_id: vehicle.id,
        vehicle_number:
          vehicle.vehicle_number,
        vehicle_name:
          vehicle.vehicle_name,
        policies: [],
      };
    });

    // --------------------------------------------------
    // ADD ACTIVE INSURANCE POLICIES
    // --------------------------------------------------

    insuranceRecords.forEach((record) => {
      if (!groups[record.vehicle_id]) {
        groups[record.vehicle_id] = {
          vehicle_id:
            record.vehicle_id,
          vehicle_number:
            record.vehicle_number,
          vehicle_name:
            record.vehicle_name,
          policies: [],
        };
      }

      groups[
        record.vehicle_id
      ].policies.push(record);
    });

    return Object.values(groups);
  }, [vehicles, insuranceRecords]);

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
  // INSURANCE TYPE LABEL
  // ======================================================

  const getInsuranceTypeLabel = (type) => {
    if (!type) return "—";

    const normalizedType = type
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    switch (normalizedType) {
      case "own_damage":
        return "Own Damage";

      case "third_party":
        return "Third Party";

      case "comprehensive":
        return "Comprehensive";

      default:
        return type;
    }
  };

  // ======================================================
  // NORMALIZE INSURANCE TYPE
  // ======================================================

  const normalizeInsuranceType = (type) => {
    if (!type) return "";

    return type
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  };

  // ======================================================
  // INDIVIDUAL POLICY EXPIRY STATUS
  // ======================================================

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
      return {
        status: "unknown",
        label: "Unknown",
      };
    }

    const expiry = new Date(expiryDate);
    const now = new Date();

    const expiryUTC = new Date(
      Date.UTC(
        expiry.getFullYear(),
        expiry.getMonth(),
        expiry.getDate()
      )
    );

    const todayUTC = new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
    );

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const daysRemaining = Math.ceil(
      (expiryUTC - todayUTC) /
        millisecondsPerDay
    );

    // --------------------------------------------------
    // EXPIRED
    // --------------------------------------------------

    if (daysRemaining < 0) {
      return {
        status: "expired",
        label: "Expired",
      };
    }

    // --------------------------------------------------
    // EXPIRES TODAY
    // --------------------------------------------------

    if (daysRemaining === 0) {
      return {
        status: "expires_today",
        label: "Expires Today",
      };
    }

    // --------------------------------------------------
    // EXPIRING SOON
    // --------------------------------------------------

    if (daysRemaining <= 30) {
      return {
        status: "expiring_soon",
        label: `Expires in ${daysRemaining} days`,
      };
    }

    // --------------------------------------------------
    // VALID
    // --------------------------------------------------

    return {
      status: "valid",
      label: "Valid",
    };
  };

  // ======================================================
  // OVERALL VEHICLE INSURANCE STATUS
  //
  // No insurance
  //      -> Pending
  //
  // Only OD
  //      -> Pending
  //
  // Only TP
  //      -> Pending
  //
  // OD + TP without Comprehensive
  //      -> Pending
  //
  // Comprehensive exists
  //      -> Comprehensive expiry determines status
  // ======================================================

  const getVehicleInsuranceStatus = (
    vehicle
  ) => {
    // --------------------------------------------------
    // NO INSURANCE
    // --------------------------------------------------

    if (!vehicle.policies.length) {
      return {
        status: "pending",
        label: "Pending",
      };
    }

    // --------------------------------------------------
    // FIND COMPREHENSIVE POLICY
    // --------------------------------------------------

    const comprehensivePolicy =
      vehicle.policies.find((policy) => {
        return (
          normalizeInsuranceType(
            policy.insurance_type
          ) === "comprehensive"
        );
      });

    // --------------------------------------------------
    // NO COMPREHENSIVE
    // --------------------------------------------------

    if (!comprehensivePolicy) {
      return {
        status: "pending",
        label: "Pending",
      };
    }

    // --------------------------------------------------
    // COMPREHENSIVE EXISTS
    // --------------------------------------------------

    return getExpiryStatus(
      comprehensivePolicy.expiry_date
    );
  };

  // ======================================================
  // INDIVIDUAL POLICY DISPLAY STATUS
  // ======================================================

  const getPolicyDisplayStatus = (
    policy,
    vehicle
  ) => {
    const policyStatus =
      getExpiryStatus(
        policy.expiry_date
      );

    const policyType =
      normalizeInsuranceType(
        policy.insurance_type
      );

    const hasComprehensive =
      vehicle.policies.some(
        (item) =>
          normalizeInsuranceType(
            item.insurance_type
          ) === "comprehensive"
      );

    // --------------------------------------------------
    // NO COMPREHENSIVE COVERAGE
    // --------------------------------------------------

    if (
      !hasComprehensive &&
      (policyType === "own_damage" ||
        policyType === "third_party")
    ) {
      return {
        status: "incomplete",
        label: "Coverage Incomplete",
      };
    }

    // --------------------------------------------------
    // COMPREHENSIVE POLICY
    // --------------------------------------------------

    return policyStatus;
  };

  // ======================================================
  // STATUS PRIORITY
  //
  // Pending
  // Expired
  // Expiring Soon
  // Valid
  // ======================================================

  const getStatusPriority = (status) => {
    switch (status) {
      case "pending":
        return 0;

      case "expired":
        return 1;

      case "expires_today":
        return 2;

      case "expiring_soon":
        return 2;

      case "valid":
        return 3;

      default:
        return 0;
    }
  };

  // ======================================================
  // SORT VEHICLES
  // ======================================================

  const sortedVehicles = useMemo(() => {
    return [...groupedVehicles].sort(
      (a, b) => {
        const statusA =
          getVehicleInsuranceStatus(a);

        const statusB =
          getVehicleInsuranceStatus(b);

        return (
          getStatusPriority(
            statusA.status
          ) -
          getStatusPriority(
            statusB.status
          )
        );
      }
    );
  }, [groupedVehicles]);

  // ======================================================
  // STATUS FILTER
  // ======================================================

  const statusFilteredVehicles =
    useMemo(() => {
      if (!statusFilter) {
        return sortedVehicles;
      }

      return sortedVehicles.filter(
        (vehicle) => {
          const vehicleStatus =
            getVehicleInsuranceStatus(
              vehicle
            );

          return (
            vehicleStatus.status ===
            statusFilter
          );
        }
      );
    }, [
      sortedVehicles,
      statusFilter,
    ]);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredVehicles = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return statusFilteredVehicles.filter(
      (vehicle) => {
        if (!search) {
          return true;
        }

        return (
          vehicle.vehicle_number
            ?.toLowerCase()
            .includes(search) ||
          vehicle.vehicle_name
            ?.toLowerCase()
            .includes(search)
        );
      }
    );
  }, [
    statusFilteredVehicles,
    searchTerm,
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
  }, [loading, recentlyViewedVehicleId, filteredVehicles]);

  // ======================================================
  // CLEAR STATUS FILTER
  // ======================================================

  const clearStatusFilter = () => {
    setSearchParams({});
  };

  // ======================================================
  // STATUS FILTER LABEL
  // ======================================================

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case "pending":
        return "Pending";

      case "expired":
        return "Expired";

      case "expiring_soon":
        return "Expiring Soon";

      case "valid":
        return "Valid";

      default:
        return "";
    }
  };

  // ======================================================
  // STATUS STYLES
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

      case "pending":
        return "bg-red-50 text-red-500";

      case "incomplete":
        return "bg-amber-50 text-amber-600";

      default:
        return "bg-gray-100 text-gray-500";
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
            Insurance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage active insurance policies for your vehicles.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/insurance/add")
          }
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus size={17} />
          Add Insurance
        </button>

      </div>

      {/* ==================================================
          ACTIVE STATUS FILTER
      ================================================== */}

      {statusFilter && (
        <div className="mb-4 flex items-center gap-2">

          <span className="text-sm text-gray-500">
            Filter:
          </span>

          <button
            type="button"
            onClick={clearStatusFilter}
            className={`group flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${getStatusStyles(
              statusFilter
            )}`}
          >
            {getStatusFilterLabel()}

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
            setSearchTerm(e.target.value)
          }
          placeholder="Search vehicles..."
          className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />

      </div>

      {/* ==================================================
          INSURANCE TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {loading ? (

          <div className="flex min-h-60 items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

              <p className="text-sm font-medium text-gray-500">
                Loading insurance records...
              </p>

            </div>

          </div>

        ) : filteredVehicles.length === 0 ? (

          <div className="flex min-h-60 flex-col items-center justify-center">

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Car size={24} />
            </div>

            <p className="font-semibold text-gray-700">
              No vehicles found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {statusFilter
                ? `No vehicles with ${getStatusFilterLabel().toLowerCase()} insurance.`
                : "Try searching with a different vehicle number or name."}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead>

                <tr className="border-b border-gray-100 bg-gray-50/70">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Vehicle
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Insurance Company
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Policy Number
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

                {filteredVehicles.map(
                  (vehicle) => {

                    // ==================================================
                    // OVERALL VEHICLE STATUS
                    // ==================================================

                    const vehicleStatus =
                      getVehicleInsuranceStatus(
                        vehicle
                      );

                    return (
                      <tr
                        key={
                          vehicle.vehicle_id
                        }
                        ref={
                          String(vehicle.vehicle_id) ===
                          String(recentlyViewedVehicleId)
                            ? recentlyViewedRowRef
                            : null
                        }
                        className={`border-b border-gray-100 last:border-0 ${
                          String(vehicle.vehicle_id) === String(recentlyViewedVehicleId)
                            ? "bg-emerald-50/50"
                            : ""
                        }`}
                      >

                        {/* ==================================================
                            VEHICLE
                        ================================================== */}

                        <td className="px-6 py-5 align-top">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <Car size={19} />
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-gray-800">
                                {
                                  vehicle.vehicle_number
                                }
                              </p>

                              {String(vehicle.vehicle_id) === String(recentlyViewedVehicleId) && (
                                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Recently viewed
                                </span>
                              )}

                              <p className="text-xs text-gray-400">
                                {
                                  vehicle.vehicle_name ||
                                  "—"
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* ==================================================
                            POLICIES
                        ================================================== */}

                        <td
                          colSpan={5}
                          className="px-0 py-0"
                        >

                          {vehicle.policies.length ===
                          0 ? (

                            // ------------------------------------------------
                            // NO INSURANCE
                            // ------------------------------------------------

                            <div className="grid min-h-[88px] grid-cols-[1.2fr_1fr_1.2fr_1fr_0.9fr] items-center gap-4 px-6">

                              <div className="text-sm text-gray-400">
                                —
                              </div>

                              <div className="text-sm text-gray-400">
                                —
                              </div>

                              <div className="text-sm text-gray-400">
                                —
                              </div>

                              <div className="text-sm text-gray-400">
                                —
                              </div>

                              <div>

                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                                    vehicleStatus.status
                                  )}`}
                                >
                                  {
                                    vehicleStatus.label
                                  }
                                </span>

                              </div>

                            </div>

                          ) : (

                            <div className="divide-y divide-gray-50">

                              {vehicle.policies.map(
                                (policy) => {

                                  // ==================================================
                                  // INDIVIDUAL POLICY DISPLAY STATUS
                                  // ==================================================

                                  const policyStatus =
                                    getPolicyDisplayStatus(
                                      policy,
                                      vehicle
                                    );

                                  return (
                                    <div
                                      key={
                                        policy.insurance_id
                                      }
                                      className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_0.9fr] items-center gap-4 px-6 py-4"
                                    >

                                      {/* Company */}

                                      <div className="text-sm font-medium text-gray-700">
                                        {
                                          policy.insurance_company ||
                                          "—"
                                        }
                                      </div>

                                      {/* Type */}

                                      <div className="text-sm text-gray-600">
                                        {getInsuranceTypeLabel(
                                          policy.insurance_type
                                        )}
                                      </div>

                                      {/* Policy Number */}

                                      <div className="text-sm text-gray-600">
                                        {
                                          policy.policy_number ||
                                          "—"
                                        }
                                      </div>

                                      {/* Expiry */}

                                      <div className="text-sm text-gray-600">
                                        {formatDate(
                                          policy.expiry_date
                                        )}
                                      </div>

                                      {/* Individual Policy Status */}

                                      <div>

                                        <span
                                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                                            policyStatus.status
                                          )}`}
                                        >
                                          {
                                            policyStatus.label
                                          }
                                        </span>

                                      </div>

                                    </div>
                                  );
                                }
                              )}

                            </div>

                          )}

                        </td>

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <td className="px-6 py-5 align-middle">

                          <div className="flex items-center justify-end gap-2">

                            {/* Edit */}

                            {vehicle.policies.length >
                              0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  openVehicleInsurance(
                                    vehicle.vehicle_id,
                                    `/insurance/edit/${vehicle.vehicle_id}`
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
                                openVehicleInsurance(
                                  vehicle.vehicle_id,
                                  `/insurance/details/${vehicle.vehicle_id}`
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
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Insurance;
