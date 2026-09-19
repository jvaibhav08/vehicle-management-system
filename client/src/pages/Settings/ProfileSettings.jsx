import { useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Pencil,
  X,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "Vaibhav Jha",
    email: "vaibhav@example.com",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // API will be connected later
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Profile Settings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your personal account information.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        {/* Profile Top Section */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <User size={28} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {formData.name}
              </h3>

              <p className="text-sm text-gray-500">
                {formData.email}
              </p>
            </div>
          </div>

          {!isEditing && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="!w-auto shrink-0 whitespace-nowrap px-5 py-2.5"
            >
              <span className="flex items-center gap-2">
                <Pencil size={16} />
                Edit Profile
              </span>
            </Button>
          )}
        </div>

        <div className="my-6 border-t border-gray-100" />

        {/* Edit Mode */}
        {isEditing ? (
          <div className="space-y-5">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="!w-auto shrink-0 whitespace-nowrap px-5 py-2.5"
              >
                <span className="flex items-center gap-2">
                  <X size={16} />
                  Cancel
                </span>
              </Button>

              <Button
                type="button"
                onClick={handleSave}
                className="!w-auto shrink-0 whitespace-nowrap px-5 py-2.5"
              >
                <span className="flex items-center gap-2">
                  Save Changes
                </span>
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="grid gap-x-12 gap-y-5 sm:grid-cols-2">
            {/* Name */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                <User size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Full Name
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {formData.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                <Mail size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Email
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {formData.email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Role
                </p>

                <p className="text-sm font-medium capitalize text-gray-700">
                  User
                </p>
              </div>
            </div>

            {/* Account */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                <Calendar size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Account
                </p>

                <p className="text-sm font-medium text-gray-700">
                  Active
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ProfileSettings;