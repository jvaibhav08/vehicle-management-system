import { useState } from "react";
import {
  Bell,
  ShieldAlert,
  FileWarning,
  Car,
  Mail,
} from "lucide-react";

import Card from "../../components/common/Card";

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    expiryAlerts: true,
    vehicleAlerts: true,
    emailNotifications: true,
    systemNotifications: true,
  });

  const handleToggle = (name) => {
    setNotifications({
      ...notifications,
      [name]: !notifications[name],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Notification Settings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose which notifications you want to receive.
        </p>
      </div>

      {/* Notification Card */}
      <Card>
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Bell size={20} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>

            <p className="text-sm text-gray-500">
              Manage alerts and notifications for your vehicles.
            </p>
          </div>
        </div>

        <div className="my-6 border-t border-gray-100" />

        {/* Expiry Alerts */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <ShieldAlert size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Expiry Alerts
              </p>

              <p className="text-xs text-gray-400">
                Get alerts when insurance or PUC is nearing expiry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("expiryAlerts")}
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
              notifications.expiryAlerts
                ? "bg-emerald-500"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                notifications.expiryAlerts
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Vehicle Alerts */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Car size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Vehicle Alerts
              </p>

              <p className="text-xs text-gray-400">
                Receive important updates about your vehicles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("vehicleAlerts")}
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
              notifications.vehicleAlerts
                ? "bg-emerald-500"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                notifications.vehicleAlerts
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Email Notifications */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Mail size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Email Notifications
              </p>

              <p className="text-xs text-gray-400">
                Receive important system notifications by email.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("emailNotifications")}
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
              notifications.emailNotifications
                ? "bg-emerald-500"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                notifications.emailNotifications
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* System Notifications */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <FileWarning size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                System Notifications
              </p>

              <p className="text-xs text-gray-400">
                Receive important application and system updates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("systemNotifications")}
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
              notifications.systemNotifications
                ? "bg-emerald-500"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                notifications.systemNotifications
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}

export default NotificationSettings;