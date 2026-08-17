import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

function Toast({ type = "success", message, onClose }) {
  const styles = {
    success: {
      icon: CheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
    },

    error: {
      icon: XCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      border: "border-red-100",
    },

    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-100",
    },

    info: {
      icon: Info,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-blue-100",
    },
  };

  const currentStyle = styles[type] || styles.success;
  const Icon = currentStyle.icon;

  return (
    <div
      className={`fixed right-6 top-6 z-[9999] flex min-w-[320px] max-w-md items-center gap-3 rounded-2xl border ${currentStyle.border} bg-white px-4 py-3.5 shadow-xl shadow-gray-900/10`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${currentStyle.iconBg}`}
      >
        <Icon size={20} className={currentStyle.iconColor} />
      </div>

      {/* Message */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800">
          {type === "success" && "Success"}
          {type === "error" && "Error"}
          {type === "warning" && "Warning"}
          {type === "info" && "Information"}
        </p>

        <p className="mt-0.5 text-sm text-gray-500">
          {message}
        </p>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;