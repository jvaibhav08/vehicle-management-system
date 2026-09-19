import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // API will be connected later
    console.log("Password change requested");
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Security Settings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your password and account security.
        </p>
      </div>

      {/* Security Card */}
      <Card>
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Lock size={20} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Change Password
            </h3>

            <p className="text-sm text-gray-500">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <div className="my-6 border-t border-gray-100" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="relative">
            <Input
              label="Current Password"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              className="absolute right-3 top-[38px] cursor-pointer border-0 bg-transparent p-1 text-gray-400 outline-none transition hover:text-gray-600"
            >
              {showCurrentPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Input
              label="New Password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(!showNewPassword)
              }
              className="absolute right-3 top-[38px] cursor-pointer border-0 bg-transparent p-1 text-gray-400 outline-none transition hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-[38px] cursor-pointer border-0 bg-transparent p-1 text-gray-400 outline-none transition hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Password Requirements
                </p>

                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li>• At least 8 characters</li>
                  <li>• Include at least one uppercase letter</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 outline-none transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 outline-none transition hover:from-emerald-600 hover:to-teal-700"
            >
              Update Password
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SecuritySettings;