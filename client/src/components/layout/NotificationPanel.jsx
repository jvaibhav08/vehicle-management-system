import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  X,
  Bell,
  ShieldCheck,
  FileCheck,
  Car,
} from "lucide-react";

function NotificationPanel({
  dashboard,
  dismissedNotifications = [],
  onDismiss,
  onClose,
}) {
  const navigate = useNavigate();

  // ======================================================
  // CLOSE ON ESCAPE
  // ======================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  // ======================================================
  // BUILD NOTIFICATIONS FROM DASHBOARD DATA
  // ======================================================

  const notifications = [];

  // ======================================================
  // INSURANCE EXPIRED
  // ======================================================

  if (dashboard?.insurance?.expired > 0) {
    notifications.push({
      id: "insurance-expired",

      title: "Insurance expired",

      message:
        dashboard.insurance.expired === 1
          ? "1 vehicle has expired insurance."
          : `${dashboard.insurance.expired} vehicles have expired insurance.`,

      icon: ShieldCheck,

      color:
        "bg-red-50 text-red-500",

      hoverColor:
        "hover:bg-red-50",

      path:
        "/insurance?status=expired",
    });
  }

  // ======================================================
  // INSURANCE EXPIRING SOON
  // ======================================================

  if (
    dashboard?.insurance?.expiringSoon > 0
  ) {
    notifications.push({
      id: "insurance-expiring",

      title:
        "Insurance expiring soon",

      message:
        dashboard.insurance.expiringSoon === 1
          ? "1 vehicle's insurance is expiring soon."
          : `${dashboard.insurance.expiringSoon} vehicles' insurance is expiring soon.`,

      icon: ShieldCheck,

      color:
        "bg-amber-50 text-amber-500",

      hoverColor:
        "hover:bg-amber-50",

      path:
        "/insurance?status=expiring_soon",
    });
  }

  // ======================================================
  // INSURANCE PENDING
  // ======================================================

  if (
    dashboard?.insurance?.pending > 0
  ) {
    notifications.push({
      id: "insurance-pending",

      title:
        "Insurance needs attention",

      message:
        dashboard.insurance.pending === 1
          ? "1 vehicle has incomplete or missing insurance coverage."
          : `${dashboard.insurance.pending} vehicles have incomplete or missing insurance coverage.`,

      icon: ShieldCheck,

      color:
        "bg-red-50 text-red-500",

      hoverColor:
        "hover:bg-red-50",

      path:
        "/insurance?status=pending",
    });
  }

  // ======================================================
  // PUC EXPIRED
  // ======================================================

  if (
    dashboard?.puc?.expired > 0
  ) {
    notifications.push({
      id: "puc-expired",

      title:
        "PUC expired",

      message:
        dashboard.puc.expired === 1
          ? "1 vehicle has an expired PUC."
          : `${dashboard.puc.expired} vehicles have an expired PUC.`,

      icon: FileCheck,

      color:
        "bg-red-50 text-red-500",

      hoverColor:
        "hover:bg-red-50",

      path:
        "/puc?status=expired",
    });
  }

  // ======================================================
  // PUC MISSING
  // ======================================================

  if (
    dashboard?.puc?.noPuc > 0
  ) {
    notifications.push({
      id: "puc-missing",

      title:
        "PUC missing",

      message:
        dashboard.puc.noPuc === 1
          ? "1 vehicle has no PUC details."
          : `${dashboard.puc.noPuc} vehicles have no PUC details.`,

      icon: FileCheck,

      color:
        "bg-red-50 text-red-500",

      hoverColor:
        "hover:bg-red-50",

      path:
        "/puc?status=no_puc",
    });
  }

  // ======================================================
  // PUC EXPIRING SOON
  // ======================================================

  if (
    dashboard?.puc?.expiringSoon > 0
  ) {
    notifications.push({
      id: "puc-expiring",

      title:
        "PUC expiring soon",

      message:
        dashboard.puc.expiringSoon === 1
          ? "1 vehicle's PUC is expiring soon."
          : `${dashboard.puc.expiringSoon} vehicles' PUC is expiring soon.`,

      icon: FileCheck,

      color:
        "bg-amber-50 text-amber-500",

      hoverColor:
        "hover:bg-amber-50",

      path:
        "/puc?status=expiring_soon",
    });
  }

  // ======================================================
  // RC PENDING
  // ======================================================

  if (
    dashboard?.vehicles?.rcPending > 0
  ) {
    notifications.push({
      id: "rc-pending",

      title:
        "RC pending",

      message:
        dashboard.vehicles.rcPending === 1
          ? "1 vehicle has a pending RC."
          : `${dashboard.vehicles.rcPending} vehicles have a pending RC.`,

      icon: Car,

      color:
        "bg-amber-50 text-amber-500",

      hoverColor:
        "hover:bg-amber-50",

      path:
        "/vehicles?rc_status=Pending",
    });
  }

  // ======================================================
  // REMOVE TEMPORARILY DISMISSED NOTIFICATIONS
  // ======================================================

  const visibleNotifications =
    notifications.filter(
      (notification) =>
        !dismissedNotifications.includes(
          notification.id
        )
    );

  // ======================================================
  // HANDLE NOTIFICATION CLICK
  // ======================================================

  const handleNotificationClick = (
    notification
  ) => {
    onClose();

    navigate(
      notification.path
    );
  };

  // ======================================================
  // HANDLE DISMISS
  // ======================================================

  const handleDismiss = (
    event,
    notificationId
  ) => {
    event.stopPropagation();

    onDismiss(notificationId);
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      {/* ==================================================
          BACKDROP
      ================================================== */}

      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* ==================================================
          PANEL
      ================================================== */}

      <aside
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Bell size={20} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-gray-800">
                Notifications
              </h2>

              <p className="text-xs text-gray-400">
                Items that need your attention
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close notifications"
          >
            <X size={19} />
          </button>

        </div>

        {/* ==================================================
            COUNT
        ================================================== */}

        <div className="border-b border-gray-100 px-6 py-3">

          <p className="text-xs font-medium text-gray-400">
            {visibleNotifications.length}{" "}
            {visibleNotifications.length === 1
              ? "notification"
              : "notifications"}{" "}
            requiring attention
          </p>

        </div>

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="flex-1 overflow-y-auto p-4">

          {visibleNotifications.length === 0 ? (

            <div className="flex h-full flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Bell size={25} />
              </div>

              <h3 className="text-sm font-semibold text-gray-700">
                You're all caught up
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                There are no notifications requiring your attention.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {visibleNotifications.map(
                (notification) => {

                  const Icon =
                    notification.icon;

                  return (
                    <div
                      key={
                        notification.id
                      }
                      className={`group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition ${notification.hoverColor}`}
                    >

                      <div className="flex gap-3">

                        {/* Icon */}

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.color}`}
                        >
                          <Icon size={19} />
                        </div>

                        {/* Content */}

                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className="min-w-0 flex-1 cursor-pointer text-left"
                        >

                          <p className="text-sm font-semibold text-gray-800">
                            {
                              notification.title
                            }
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {
                              notification.message
                            }
                          </p>

                          <p className="mt-2 text-xs font-semibold text-gray-400 transition group-hover:text-gray-600">
                            View details →
                          </p>

                        </button>

                        {/* Individual dismiss */}

                        <button
                          type="button"
                          onClick={(event) =>
                            handleDismiss(
                              event,
                              notification.id
                            )
                          }
                          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-300 transition hover:bg-white hover:text-gray-500"
                          aria-label="Dismiss notification"
                        >
                          <X size={15} />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="shrink-0 border-t border-gray-100 p-4">

          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
          >
            Close
          </button>

        </div>

      </aside>
    </>
  );
}

export default NotificationPanel;