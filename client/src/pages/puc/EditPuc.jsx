import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FileCheck,
  Lock,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";

import {
  getPucById,
  updatePuc,
} from "../../services/puc.service";

function EditPuc() {
  const navigate = useNavigate();
  const { pucId } = useParams();

  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vehicle, setVehicle] = useState(null);

  const [formData, setFormData] = useState({
    certificate_number: "",
    expiry_date: "",
  });

  const [errors, setErrors] = useState({});

  // ======================================================
  // FETCH PUC
  // ======================================================

  useEffect(() => {
    const fetchPuc = async () => {
      try {
        const response = await getPucById(pucId);

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to load PUC"
          );
        }

        const puc = response.data;

        // Vehicle information
        setVehicle({
          vehicle_number:
            puc.vehicle_number || "",

          vehicle_name:
            puc.vehicle_name || "",
        });

        // Editable information
        setFormData({
          certificate_number:
            puc.certificate_number || "",

          expiry_date: puc.expiry_date
            ? new Date(puc.expiry_date)
                .toISOString()
                .split("T")[0]
            : "",
        });

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

    fetchPuc();
  }, [pucId, navigate, showToast]);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

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
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.certificate_number.trim()) {
      newErrors.certificate_number =
        "PUC certificate number is required";
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date =
        "Expiry date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      showToast(
        "Please check the form and fill all required fields.",
        "error"
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updatePuc(
        pucId,
        {
          certificate_number:
            formData.certificate_number.trim(),

          expiry_date:
            formData.expiry_date,
        }
      );

      if (response.success) {
        showToast(
          response.message ||
            "PUC certificate updated successfully",
          "success"
        );

        setTimeout(() => {
          navigate("/puc");
        }, 1000);
      }

    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while updating PUC",
        "error"
      );

    } finally {
      setIsSubmitting(false);
    }
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

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <button
          type="button"
          onClick={() => navigate("/puc")}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
        >
          <ArrowLeft size={20} />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Edit PUC
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the pollution certificate details.
          </p>

        </div>

      </div>

      {/* Card */}

      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">

        {/* Card Header */}

        <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileCheck size={24} />
          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              PUC Information
            </h2>

            <p className="text-sm text-gray-400">
              Update the certificate information below.
            </p>

          </div>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Vehicle */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Vehicle
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <FileCheck size={18} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-gray-800">
                  {vehicle?.vehicle_number || "—"}
                </p>

                <p className="text-xs text-gray-400">
                  {vehicle?.vehicle_name ||
                    "Unnamed Vehicle"}
                </p>

              </div>

              <Lock
                size={16}
                className="shrink-0 text-gray-400"
              />

            </div>

            <p className="mt-2 text-xs text-gray-400">
              Vehicle cannot be changed while editing a PUC.
            </p>

          </div>

          {/* Certificate Number */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              PUC Certificate Number
            </label>

            <input
              type="text"
              name="certificate_number"
              value={formData.certificate_number}
              onChange={handleChange}
              placeholder="e.g. PUC-2026-123456"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                errors.certificate_number
                  ? "border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              }`}
            />

            {errors.certificate_number && (
              <p className="mt-2 text-xs text-red-500">
                {errors.certificate_number}
              </p>
            )}

          </div>

          {/* Expiry Date */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Expiry Date
            </label>

            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
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

          {/* Actions */}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">

            <button
              type="button"
              onClick={() => navigate("/puc")}
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
                ? "Updating..."
                : "Update PUC"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditPuc;
