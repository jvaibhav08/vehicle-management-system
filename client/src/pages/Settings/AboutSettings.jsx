import {
  Car,
  ShieldCheck,
  Code2,
  Info,
} from "lucide-react";

import Card from "../../components/common/Card";

function AboutSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          About
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Information about the Vehicle Management System.
        </p>
      </div>

      {/* Application Information */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Info size={20} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Vehicle Management System
            </h3>

            <p className="text-sm text-gray-500">
              Manage your vehicles, insurance and PUC information
              in one place.
            </p>
          </div>
        </div>

        <div className="my-6 border-t border-gray-100" />

        {/* Application Details */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Application */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Car size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Application
              </p>

              <p className="text-sm font-medium text-gray-700">
                Vehicle Management System
              </p>
            </div>
          </div>

          {/* Version */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Code2 size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Version
              </p>

              <p className="text-sm font-medium text-gray-700">
                V1.0.0
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                System Status
              </p>

              <p className="text-sm font-medium text-emerald-600">
                Active
              </p>
            </div>
          </div>

          {/* Platform */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Code2 size={18} />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Platform
              </p>

              <p className="text-sm font-medium text-gray-700">
                Web Application
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* About System */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800">
          About the System
        </h3>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          The Vehicle Management System helps users keep track of
          their vehicles and manage important documents and expiry
          information such as insurance and PUC.
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          The system is designed to provide a simple and organized
          way to manage vehicle-related information from a single
          dashboard.
        </p>
      </Card>
    </div>
  );
}

export default AboutSettings;