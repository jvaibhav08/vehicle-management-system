import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Car,
  FileCheck,
  FileText,
  Lock,
} from "lucide-react";

import { getVehicles } from "../../services/vehicle.service";
import VehicleSelect from "../../components/common/VehicleSelect";
import { useToast } from "../../context/ToastContext";
import { addPuc } from "../../services/puc.service";

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const allowedDocumentExtensions = [".pdf", ".doc", ".docx"];

function AddPuc() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const vehicleIdFromUrl =
    searchParams.get("vehicleId");

  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState([]);

  const [loadingVehicles, setLoadingVehicles] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [selectedVehicle, setSelectedVehicle] =
    useState(null);

  const [formData, setFormData] = useState({
    vehicle_id: vehicleIdFromUrl || "",
    certificate_number: "",
    expiry_date: "",
  });

  const [errors, setErrors] = useState({});
  const [document, setDocument] = useState(null);

  // ======================================================
  // FETCH VEHICLES
  // ======================================================

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles();

        if (response.success) {
          const vehicleList =
            response.data || [];

          setVehicles(vehicleList);

          // ------------------------------------------------
          // AUTO SELECT VEHICLE FROM URL
          // ------------------------------------------------

          if (vehicleIdFromUrl) {
            const vehicle =
              vehicleList.find(
                (item) =>
                  String(item.id) ===
                  String(vehicleIdFromUrl)
              );

            if (vehicle) {
              setSelectedVehicle(vehicle);

              setFormData((previous) => ({
                ...previous,
                vehicle_id:
                  String(vehicle.id),
              }));
            } else {
              showToast(
                "Selected vehicle could not be found.",
                "error"
              );

              setFormData((previous) => ({
                ...previous,
                vehicle_id: "",
              }));
            }
          }
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

  const handleDocumentChange = (e) => {
    const selectedDocument = e.target.files?.[0] || null;

    if (!selectedDocument) {
      setDocument(null);
      return;
    }

    const extension = `.${selectedDocument.name.split(".").pop()?.toLowerCase()}`;

    if (!allowedDocumentExtensions.includes(extension)) {
      setErrors((previous) => ({
        ...previous,
        document: "Upload a PDF, DOC, or DOCX document",
      }));
      e.target.value = "";
      return;
    }

    if (selectedDocument.size > MAX_DOCUMENT_SIZE) {
      setErrors((previous) => ({
        ...previous,
        document: "Document must be 5 MB or smaller",
      }));
      e.target.value = "";
      return;
    }

    setDocument(selectedDocument);
    setErrors((previous) => ({ ...previous, document: "" }));
  };

  // ======================================================
  // HANDLE SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.vehicle_id) {
      newErrors.vehicle_id =
        "Vehicle is required";
    }

    if (
      !formData.certificate_number.trim()
    ) {
      newErrors.certificate_number =
        "PUC certificate number is required";
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date =
        "Expiry date is required";
    }

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

    try {
      setIsSubmitting(true);

      const submission = new FormData();
      submission.append("vehicle_id", formData.vehicle_id);
      submission.append("certificate_number", formData.certificate_number.trim());
      submission.append("expiry_date", formData.expiry_date);

      if (document) {
        submission.append("document", document);
      }

      const response = await addPuc(submission);

      if (response.success) {
        showToast(
          response.message ||
            "PUC certificate added successfully",
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
          "Something went wrong while adding PUC",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex items-center gap-4">

        <button
          type="button"
          onClick={() => navigate("/puc")}
          disabled={isSubmitting}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add PUC
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a pollution certificate to your vehicle.
          </p>
        </div>

      </div>

      {/* ==================================================
          FORM CARD
      ================================================== */}

      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">

        {/* Form Header */}

        <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileCheck size={24} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              PUC Information
            </h2>

            <p className="text-sm text-gray-400">
              Enter the pollution certificate details.
            </p>
          </div>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >

          {/* ==================================================
              VEHICLE
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Vehicle
            </label>

            {vehicleIdFromUrl ? (

              /* --------------------------------------------
                 LOCKED VEHICLE
              -------------------------------------------- */

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Car size={18} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-gray-800">
                    {selectedVehicle?.vehicle_number ||
                      "Loading vehicle..."}
                  </p>

                  <p className="text-xs text-gray-400">
                    {selectedVehicle?.vehicle_name ||
                      "Vehicle selected automatically"}
                  </p>

                </div>

                <Lock
                  size={16}
                  className="shrink-0 text-gray-400"
                />

              </div>

            ) : (

              /* --------------------------------------------
                 NORMAL VEHICLE SELECT
              -------------------------------------------- */

              <VehicleSelect
                vehicles={vehicles}
                value={formData.vehicle_id}
                onChange={(vehicleId) => {

                  setFormData((previous) => ({
                    ...previous,
                    vehicle_id: vehicleId,
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    vehicle_id: "",
                  }));

                }}
                disabled={loadingVehicles}
              />

            )}

            {errors.vehicle_id && (
              <p className="mt-2 text-xs text-red-500">
                {errors.vehicle_id}
              </p>
            )}

          </div>

          {/* Optional Document */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              PUC Document <span className="text-gray-400">(Optional)</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition hover:border-emerald-400 hover:bg-emerald-50/50">
              <FileText size={20} className="text-emerald-600" />
              <span className="min-w-0 flex-1 truncate">
                {document ? document.name : "Choose PDF, DOC, or DOCX (max 5 MB)"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocumentChange}
                disabled={isSubmitting}
                className="sr-only"
              />
            </label>

            {errors.document && (
              <p className="mt-2 text-xs text-red-500">
                {errors.document}
              </p>
            )}

          </div>

          {/* ==================================================
              CERTIFICATE NUMBER
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              PUC Certificate Number
            </label>

            <input
              type="text"
              name="certificate_number"
              value={
                formData.certificate_number
              }
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

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 md:col-span-2">

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
              disabled={
                isSubmitting ||
                loadingVehicles ||
                (
                  !!vehicleIdFromUrl &&
                  !selectedVehicle
                )
              }
              className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : "Save PUC"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddPuc;
