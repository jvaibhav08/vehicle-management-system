import { useEffect, useState } from "react";
import { Bell, UserCircle } from "lucide-react";

import NotificationPanel from "./NotificationPanel";
import { getDashboardData } from "../../services/dashboard.service";

function Navbar() {
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [dashboard, setDashboard] = useState(null);

  const [dismissedNotifications, setDismissedNotifications] =
    useState([]);

  // ======================================================
  // FETCH DASHBOARD DATA
  // ======================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardData();

        if (response.success) {
          setDashboard(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to load notification data:",
          error
        );
      }
    };

    fetchDashboard();
  }, []);

  // ======================================================
  // BUILD NOTIFICATION COUNT
  // ======================================================

  const totalNotificationCount =
    (dashboard?.insurance?.expired > 0 ? 1 : 0) +
    (dashboard?.insurance?.expiringSoon > 0 ? 1 : 0) +
    (dashboard?.insurance?.pending > 0 ? 1 : 0) +
    (dashboard?.puc?.expired > 0 ? 1 : 0) +
    (dashboard?.puc?.noPuc > 0 ? 1 : 0) +
    (dashboard?.puc?.expiringSoon > 0 ? 1 : 0) +
    (dashboard?.vehicles?.rcPending > 0 ? 1 : 0);

  // ======================================================
  // REMOVE DISMISSED NOTIFICATIONS FROM BADGE
  // ======================================================

  const notificationCount = Math.max(
    totalNotificationCount -
      dismissedNotifications.length,
    0
  );

  // ======================================================
  // DISMISS NOTIFICATION
  // ======================================================

  const handleDismissNotification = (
    notificationId
  ) => {
    setDismissedNotifications((previous) => {
      if (previous.includes(notificationId)) {
        return previous;
      }

      return [
        ...previous,
        notificationId,
      ];
    });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">

        {/* Page title */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Dashboard
          </h2>

          <p className="text-xs text-gray-400">
            Vehicle Management System
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setShowNotifications(true)
            }
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition hover:bg-red-50 hover:text-red-500"
            aria-label="Open notifications"
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-gray-200" />

          {/* ==================================================
              USER
          ================================================== */}

          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
          >
            <UserCircle
              size={32}
              className="text-emerald-600"
            />

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-700">
                Admin
              </p>

              <p className="text-xs text-gray-400">
                Administrator
              </p>
            </div>
          </button>

        </div>

      </header>

      {/* ======================================================
          NOTIFICATION PANEL
      ====================================================== */}

      {showNotifications && (
        <NotificationPanel
          dashboard={dashboard}
          dismissedNotifications={
            dismissedNotifications
          }
          onDismiss={
            handleDismissNotification
          }
          onClose={() =>
            setShowNotifications(false)
          }
        />
      )}
    </>
  );
}

export default Navbar;