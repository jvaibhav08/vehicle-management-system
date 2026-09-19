import {
  Car,
  LayoutDashboard,
  ShieldCheck,
  FileCheck,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { logout } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Vehicles",
      icon: Car,
      path: "/vehicles",
    },
    {
      label: "Insurance",
      icon: ShieldCheck,
      path: "/insurance",
    },
    {
      label: "PUC",
      icon: FileCheck,
      path: "/puc",
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/reports",
    },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
          <Car size={21} />
        </div>

        <div>
          <h1 className="text-sm font-bold text-gray-800">
            Vehicle Management
          </h1>
          <p className="text-xs text-gray-400">System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
            }`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
