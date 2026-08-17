import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Car } from "lucide-react";

import { addVehicle } from "../../services/vehicle.service";
import { useToast } from "../../context/ToastContext";

function AddVehicle() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await addVehicle(data);

      if (response.success) {
        showToast(
          "Vehicle added successfully",
          "success"
        );

        setTimeout(() => {
          navigate("/vehicles");
        }, 1200);
      } else {
        showToast(
          response.message || "Failed to add vehicle",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while adding the vehicle",
        "error"
      );
    }
  };

  const onInvalid = () => {
    showToast(
      "Please check the form and fill all required fields.",
      "error"
    );
  };

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/vehicles")}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add Vehicle
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a new vehicle to your fleet.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">

        {/* Form Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Car size={24} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Vehicle Information
            </h2>

            <p className="text-sm text-gray-400">
              Enter the basic details of the vehicle.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >

          {/* Fields Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Vehicle Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Vehicle Number
              </label>

              <input
                type="text"
                placeholder="e.g. PB10AB1234"
                {...register("vehicle_number", {
                  required: "Vehicle number is required",
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  errors.vehicle_number
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.vehicle_number && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.vehicle_number.message}
                </p>
              )}
            </div>

            {/* Vehicle Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Vehicle Name
              </label>

              <input
                type="text"
                placeholder="e.g. Swift"
                {...register("vehicle_name", {
                  required: "Vehicle name is required",
                })}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  errors.vehicle_name
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.vehicle_name && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.vehicle_name.message}
                </p>
              )}
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>

              <select
                {...register("vehicle_type", {
                  required: "Vehicle type is required",
                })}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none transition ${
                  errors.vehicle_type
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              >
                <option value="">Select vehicle type</option>
                <option value="Four Wheeler">Four Wheeler</option>
                <option value="Two Wheeler">Two Wheeler</option>
                <option value="Commercial">Commercial</option>
                <option value="Other">Other</option>
              </select>

              {errors.vehicle_type && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.vehicle_type.message}
                </p>
              )}
            </div>

            {/* Registration Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Registration Date
              </label>

              <input
                type="date"
                {...register("registration_date", {
                  required: "Registration date is required",
                })}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none transition ${
                  errors.registration_date
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              />

              {errors.registration_date && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.registration_date.message}
                </p>
              )}
            </div>

            {/* RC Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                RC Status
              </label>

              <select
                {...register("rc_status", {
                  required: "RC status is required",
                })}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none transition ${
                  errors.rc_status
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                }`}
              >
                <option value="">Select RC status</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>

              {errors.rc_status && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.rc_status.message}
                </p>
              )}
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">

            <button
              type="button"
              onClick={() => navigate("/vehicles")}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Vehicle"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AddVehicle;