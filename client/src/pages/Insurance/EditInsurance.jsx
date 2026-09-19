import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, FileText, Lock, ShieldCheck, Trash2 } from "lucide-react";

import {
  getInsuranceByVehicleId,
  updateInsurance,
  replaceInsurancePolicyDocument,
  deleteInsurancePolicyDocument,
} from "../../services/insurance.service";

import { getVehicles } from "../../services/vehicle.service";
import { useToast } from "../../context/ToastContext";

function EditInsurance() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [searchParams] = useSearchParams();
  const policyIdFromUrl = searchParams.get("policy");

  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    insurance_company: "",
    policy_number: "",
    expiry_date: "",
    covers_own_damage: false,
    covers_third_party: false,
  });

  const [errors, setErrors] = useState({});
  const [policyDocument, setPolicyDocument] = useState(null);
  const [isUpdatingDocument, setIsUpdatingDocument] = useState(false);

  // ======================================================
  // FETCH VEHICLE + ACTIVE POLICIES
  // ======================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [vehicleResponse, insuranceResponse] =
          await Promise.all([
            getVehicles(),
            getInsuranceByVehicleId(vehicleId),
          ]);

        // ------------------------------
        // Vehicle
        // ------------------------------

        if (vehicleResponse.success) {
          const currentVehicle = vehicleResponse.data.find(
            (item) => Number(item.id) === Number(vehicleId)
          );

          setVehicle(currentVehicle || null);
        }

        // ------------------------------
        // Insurance policies
        // ------------------------------

        if (!insuranceResponse.success) {
          showToast(
            insuranceResponse.message ||
              "Failed to load insurance policies",
            "error"
          );
          return;
        }

        const activePolicies =
          insuranceResponse.data?.active || [];

        setPolicies(activePolicies);

        // --------------------------------------------------
        // Select policy
        //
        // If a policy ID was passed in the URL:
        // /insurance/edit/:vehicleId?policy=:policyId
        //
        // select that policy automatically.
        //
        // Otherwise preserve the existing behaviour:
        // select the first active policy.
        // --------------------------------------------------

        if (activePolicies.length > 0) {
          const policyFromUrl = policyIdFromUrl
            ? activePolicies.find(
                (policy) =>
                  String(policy.id) ===
                  String(policyIdFromUrl)
              )
            : null;

          const policyToLoad =
            policyFromUrl || activePolicies[0];

          setSelectedPolicyId(
            String(policyToLoad.id)
          );

          loadPolicyIntoForm(policyToLoad);
        }
      } catch (error) {
        console.error(error);

        showToast(
          error.response?.data?.message ||
            "Something went wrong while loading insurance",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId, policyIdFromUrl]);

  // ======================================================
  // LOAD POLICY INTO FORM
  // ======================================================

  const loadPolicyIntoForm = (policy) => {
    setFormData({
      insurance_company:
        policy.insurance_company || "",

      policy_number:
        policy.policy_number || "",

      expiry_date: policy.expiry_date
        ? policy.expiry_date.split("T")[0]
        : "",

      covers_own_damage:
        policy.insurance_type === "own_damage" ||
        policy.insurance_type === "comprehensive",

      covers_third_party:
        policy.insurance_type === "third_party" ||
        policy.insurance_type === "comprehensive",
    });

    setErrors({});
    setPolicyDocument(null);
  };

  // ======================================================
  // POLICY SELECT
  // ======================================================

  const handlePolicyChange = (e) => {
    const policyId = e.target.value;

    setSelectedPolicyId(policyId);

    const selectedPolicy = policies.find(
      (policy) =>
        String(policy.id) === String(policyId)
    );

    if (selectedPolicy) {
      loadPolicyIntoForm(selectedPolicy);
    }
  };

  // ======================================================
  // INPUT CHANGE
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
  // COVERAGE CHANGE
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

  const handlePolicyDocumentChange = (e) => {
    const document = e.target.files?.[0] || null;
    if (!document) return setPolicyDocument(null);

    const extension = `.${document.name.split(".").pop()?.toLowerCase()}`;
    if (![".pdf", ".doc", ".docx"].includes(extension) || document.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        document: ![".pdf", ".doc", ".docx"].includes(extension)
          ? "Upload a PDF, DOC, or DOCX document"
          : "Document must be 5 MB or smaller",
      }));
      e.target.value = "";
      return;
    }

    setPolicyDocument(document);
    setErrors((previous) => ({ ...previous, document: "" }));
  };

  const refreshSelectedPolicy = (updatedPolicy) => {
    setPolicies((previous) => previous.map((policy) =>
      String(policy.id) === String(updatedPolicy.id) ? updatedPolicy : policy
    ));
  };

  const handleReplaceDocument = async () => {
    if (!selectedPolicyId || !policyDocument) return;
    try {
      setIsUpdatingDocument(true);
      const response = await replaceInsurancePolicyDocument(selectedPolicyId, policyDocument);
      if (response.success) {
        refreshSelectedPolicy(response.data);
        setPolicyDocument(null);
        showToast(response.message, "success");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update policy document", "error");
    } finally {
      setIsUpdatingDocument(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedPolicyId) return;
    try {
      setIsUpdatingDocument(true);
      const response = await deleteInsurancePolicyDocument(selectedPolicyId);
      if (response.success) {
        setPolicies((previous) => previous.map((policy) =>
          String(policy.id) === String(selectedPolicyId) ? { ...policy, policy_path: null, policy_name: null } : policy
        ));
        showToast(response.message, "success");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete policy document", "error");
    } finally {
      setIsUpdatingDocument(false);
    }
  };

  // ======================================================
  // GET INSURANCE TYPE
  // ======================================================

  const getInsuranceType = () => {
    if (
      formData.covers_own_damage &&
      formData.covers_third_party
    ) {
      return "comprehensive";
    }

    if (formData.covers_own_damage) {
      return "own_damage";
    }

    if (formData.covers_third_party) {
      return "third_party";
    }

    return "";
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!selectedPolicyId) {
      newErrors.policy = "Please select a policy";
    }

    if (!formData.insurance_company.trim()) {
      newErrors.insurance_company =
        "Insurance company is required";
    }

    if (!formData.policy_number.trim()) {
      newErrors.policy_number =
        "Policy number is required";
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date =
        "Expiry date is required";
    }

    const insuranceType = getInsuranceType();

    if (!insuranceType) {
      newErrors.coverage =
        "Select at least one coverage type";
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

      const payload = {
        insurance_company:
          formData.insurance_company.trim(),

        policy_number:
          formData.policy_number.trim(),

        expiry_date:
          formData.expiry_date,

        covers_own_damage:
          formData.covers_own_damage,

        covers_third_party:
          formData.covers_third_party,
      };

      const response = await updateInsurance(
        selectedPolicyId,
        payload
      );

      if (response.success) {
        showToast(
          response.message ||
            "Insurance updated successfully",
          "success"
        );

        setTimeout(() => {
          navigate("/insurance");
        }, 800);
      } else {
        showToast(
          response.message ||
            "Failed to update insurance",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while updating insurance",
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
  // NO ACTIVE POLICY
  // ======================================================

  if (policies.length === 0) {
    return (
      <div className="p-6 lg:p-8">
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
              Edit Insurance
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              No active insurance policy is available for
              this vehicle.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-gray-700">
            No active insurance policy found
          </p>

          <button
            type="button"
            onClick={() => navigate("/insurance")}
            className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Back to Insurance
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/insurance")}
          disabled={isSubmitting}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Insurance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the insurance policy details.
          </p>
        </div>
      </div>

      {/* CARD */}

      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">

        {/* CARD HEADER */}

        <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Insurance Information
            </h2>

            <p className="text-sm text-gray-400">
              Select a policy and update its details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ROW 1 */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* VEHICLE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Vehicle
              </label>

              <div className="flex h-[58px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {vehicle?.vehicle_number || "—"}
                  </p>

                  <p className="truncate text-xs text-gray-400">
                    {vehicle?.vehicle_name ||
                      "Unnamed Vehicle"}
                  </p>
                </div>

                <Lock
                  size={17}
                  className="shrink-0 text-gray-400"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Vehicle cannot be changed while editing
                insurance.
              </p>
            </div>

            {/* SELECT POLICY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Policy
              </label>

              <select
                value={selectedPolicyId}
                onChange={handlePolicyChange}
                disabled={isSubmitting}
                className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition ${
                  errors.policy
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              >
                <option value="">
                  Select policy
                </option>

                {policies.map((policy) => (
                  <option
                    key={policy.id}
                    value={policy.id}
                  >
                    {policy.insurance_company} —{" "}
                    {policy.insurance_type ===
                    "comprehensive"
                      ? "Comprehensive"
                      : policy.insurance_type ===
                        "own_damage"
                      ? "Own Damage"
                      : "Third Party"}{" "}
                    — {policy.policy_number}
                  </option>
                ))}
              </select>

              {errors.policy && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.policy}
                </p>
              )}
            </div>
          </div>

          {/* ROW 2 */}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* COMPANY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Insurance Company
              </label>

              <input
                type="text"
                name="insurance_company"
                value={formData.insurance_company}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. SBI General"
                className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition ${
                  errors.insurance_company
                    ? "border-red-400"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.insurance_company && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.insurance_company}
                </p>
              )}
            </div>

            {/* POLICY NUMBER */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Policy Number
              </label>

              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. POL-2026-123456"
                className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition ${
                  errors.policy_number
                    ? "border-red-400"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.policy_number && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.policy_number}
                </p>
              )}
            </div>
          </div>

          {/* ROW 3 */}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* EXPIRY DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Expiry Date
              </label>

              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-xl border px-4 py-3.5 text-sm text-gray-700 outline-none transition ${
                  errors.expiry_date
                    ? "border-red-400"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.expiry_date && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.expiry_date}
                </p>
              )}
            </div>

            {/* COVERAGE */}

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Coverage
              </label>

              <div className="flex gap-3">

                {/* OWN DAMAGE */}

                <label
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3.5 transition ${
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

                  <span className="text-sm font-medium text-gray-700">
                    Own Damage
                  </span>
                </label>

                {/* THIRD PARTY */}

                <label
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3.5 transition ${
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

                  <span className="text-sm font-medium text-gray-700">
                    Third Party
                  </span>
                </label>
              </div>

              {errors.coverage && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.coverage}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-400">
                Select both for Comprehensive coverage.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Policy Document <span className="text-gray-400">(Optional)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition hover:border-emerald-400 hover:bg-emerald-50/50">
                <FileText size={20} className="text-emerald-600" />
                <span className="min-w-0 flex-1 truncate">{policyDocument ? policyDocument.name : "Choose PDF, DOC, or DOCX (max 5 MB)"}</span>
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handlePolicyDocumentChange} disabled={isUpdatingDocument} className="sr-only" />
              </label>
              {errors.document && <p className="mt-2 text-xs text-red-500">{errors.document}</p>}
              {policyDocument && (
                <p className="mt-2 text-xs font-medium text-amber-600">
                  A new file has been selected. Please click Upload & Replace before updating insurance details.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Current Policy Document</label>
              {policies.find((policy) => String(policy.id) === String(selectedPolicyId))?.policy_path ? (
                <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-600">
                    {policies.find((policy) => String(policy.id) === String(selectedPolicyId))?.policy_name || "Uploaded policy document"}
                  </span>
                  <button type="button" onClick={handleDeleteDocument} disabled={isUpdatingDocument} className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-red-600 disabled:opacity-60"><Trash2 size={16} /> Delete</button>
                </div>
              ) : <p className="pt-3 text-sm text-gray-400">No policy document uploaded.</p>}
              {policyDocument && <button type="button" onClick={handleReplaceDocument} disabled={isUpdatingDocument} className="mt-2 cursor-pointer text-sm font-semibold text-emerald-700 disabled:opacity-60">{isUpdatingDocument ? "Uploading..." : "Upload & Replace"}</button>}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">

            <button
              type="button"
              onClick={() => navigate("/insurance")}
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || Boolean(policyDocument)}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Updating..."
                : "Update Insurance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditInsurance;
