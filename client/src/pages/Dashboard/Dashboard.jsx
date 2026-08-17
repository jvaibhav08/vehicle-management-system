import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Car,
  ShieldCheck,
  FileCheck,
  Plus,
} from "lucide-react";

import { getDashboardData } from "../../services/dashboard.service";

function StatusRow({
  label,
  count,
  color,
  hoverColor,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition duration-150 ${hoverColor}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${color} transition-transform duration-150 group-hover:scale-110`}
        />

        <span className="text-sm text-gray-600 transition-colors duration-150 group-hover:text-gray-800">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-gray-800 transition-transform duration-150 group-hover:translate-x-0.5">
        {count ?? 0}
      </span>
    </button>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboardData();

      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">

          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-sm text-gray-500">
          Unable to load dashboard data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">

      {/* ==================================================
          WELCOME BANNER
      ================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-7 shadow-lg shadow-emerald-500/20 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back 👋
          </h1>

          <p className="mt-1 text-sm text-emerald-100">
            Here's what's happening with your fleet today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/vehicles/add")}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition duration-150 hover:bg-emerald-50"
        >
          <Plus size={16} />
          Add Vehicle
        </button>

      </div>

      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* ==================================================
            VEHICLES
        ================================================== */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Vehicles
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Car size={20} />
            </div>

          </div>

          <p className="text-4xl font-bold text-gray-800">
            {dashboard.totalVehicles}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Active in fleet
          </p>

          {/* RC STATUS */}

          <div className="mt-5 border-t border-gray-100 pt-3">

            <StatusRow
              label="RC Received"
              count={
                dashboard.vehicles?.rcReceived
              }
              color="bg-emerald-500"
              hoverColor="hover:bg-emerald-50"
              onClick={() =>
                navigate(
                  "/vehicles?rc_status=Received"
                )
              }
            />

            <StatusRow
              label="RC Pending"
              count={
                dashboard.vehicles?.rcPending
              }
              color="bg-amber-400"
              hoverColor="hover:bg-amber-50"
              onClick={() =>
                navigate(
                  "/vehicles?rc_status=Pending"
                )
              }
            />

          </div>

        </div>

        {/* ==================================================
            INSURANCE
        ================================================== */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Insurance
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </div>

          </div>

          <div className="space-y-1">

            {/* VALID */}

            <StatusRow
              label="Valid"
              count={
                dashboard.insurance?.valid
              }
              color="bg-emerald-500"
              hoverColor="hover:bg-emerald-50"
              onClick={() =>
                navigate(
                  "/insurance?status=valid"
                )
              }
            />

            {/* EXPIRING SOON */}

            <StatusRow
              label="Expiring soon"
              count={
                dashboard.insurance?.expiringSoon
              }
              color="bg-amber-400"
              hoverColor="hover:bg-amber-50"
              onClick={() =>
                navigate(
                  "/insurance?status=expiring_soon"
                )
              }
            />

            {/* EXPIRED */}

            <StatusRow
              label="Expired"
              count={
                dashboard.insurance?.expired
              }
              color="bg-red-500"
              hoverColor="hover:bg-red-50"
              onClick={() =>
                navigate(
                  "/insurance?status=expired"
                )
              }
            />

            {/* PENDING */}

            <StatusRow
              label="Pending"
              count={
                dashboard.insurance?.pending
              }
              color="bg-red-500"
              hoverColor="hover:bg-red-50"
              onClick={() =>
                navigate(
                  "/insurance?status=pending"
                )
              }
            />

          </div>

        </div>

        {/* ==================================================
            PUC
        ================================================== */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              PUC
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileCheck size={20} />
            </div>

          </div>

          <div className="space-y-1">

            {/* VALID */}

            <StatusRow
              label="Valid"
              count={
                dashboard.puc?.valid
              }
              color="bg-emerald-500"
              hoverColor="hover:bg-emerald-50"
              onClick={() =>
                navigate(
                  "/puc?status=valid"
                )
              }
            />

            {/* EXPIRING SOON */}

            <StatusRow
              label="Expiring soon"
              count={
                dashboard.puc?.expiringSoon
              }
              color="bg-amber-400"
              hoverColor="hover:bg-amber-50"
              onClick={() =>
                navigate(
                  "/puc?status=expiring_soon"
                )
              }
            />

            {/* EXPIRED */}

            <StatusRow
              label="Expired"
              count={
                dashboard.puc?.expired
              }
              color="bg-red-500"
              hoverColor="hover:bg-red-50"
              onClick={() =>
                navigate(
                  "/puc?status=expired"
                )
              }
            />

            {/* NO PUC */}

            <StatusRow
              label="No PUC"
              count={
                dashboard.puc?.noPuc
              }
              color="bg-gray-400"
              hoverColor="hover:bg-gray-50"
              onClick={() =>
                navigate(
                  "/puc?status=no_puc"
                )
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;