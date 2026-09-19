import { useState } from "react";

import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";
import AboutSettings from "./AboutSettings";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      label: "Profile",
    },
    {
      id: "security",
      label: "Security",
    },
    {
      id: "notifications",
      label: "Notifications",
    },
    {
    id: "about",
    label: "About",
    },
        
  ];

  return (
    <div className="space-y-6 p-8">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer border-b-2 px-1 pb-3 text-sm font-semibold outline-none transition ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile */}
      {activeTab === "profile" && <ProfileSettings />}

      {/* Security */}
      {activeTab === "security" && <SecuritySettings />}

      {/* Notifications */}
      {activeTab === "notifications" && <NotificationSettings />}

      {/* About */}
    {activeTab === "about" && <AboutSettings />}
    </div>
  );
}

export default Settings;