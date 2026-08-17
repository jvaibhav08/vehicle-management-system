import { useEffect, useRef, useState } from "react";
import { Search, Car, Check } from "lucide-react";

function VehicleSelect({
  vehicles = [],
  value = "",
  onChange,
  disabled = false,
}) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const containerRef = useRef(null);

  const selectedVehicle = vehicles.find(
    (vehicle) => String(vehicle.id) === String(value)
  );

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return false;
    }

    return (
      vehicle.vehicle_number
        ?.toLowerCase()
        .includes(searchValue) ||
      vehicle.vehicle_name
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  // Select vehicle
  const handleSelect = (vehicle) => {
    onChange(vehicle.id);

    setSearch(
      `${vehicle.vehicle_number} — ${
        vehicle.vehicle_name || "Unnamed Vehicle"
      }`
    );

    setShowResults(false);
  };

  // Search input
  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    setShowResults(true);

    // Clear selected vehicle if user edits the search
    if (
      selectedVehicle &&
      !value.includes(selectedVehicle.vehicle_number)
    ) {
      onChange("");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Search Input */}

      <div
        className={`flex items-center rounded-xl border bg-white transition ${
          showResults
            ? "border-emerald-500 ring-2 ring-emerald-100"
            : "border-gray-200"
        } ${
          disabled
            ? "cursor-not-allowed bg-gray-50"
            : ""
        }`}
      >
        <Search
          size={18}
          className="ml-4 shrink-0 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={handleSearch}
          onFocus={() => {
            if (search.trim()) {
              setShowResults(true);
            }
          }}
          disabled={disabled}
          placeholder={
            disabled
              ? "Loading vehicles..."
              : "Search vehicle number or name..."
          }
          autoComplete="off"
          className="w-full bg-transparent px-3 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>

      {/* Search Results */}

      {showResults && !disabled && search.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">

          {filteredVehicles.length === 0 ? (
            <div className="px-4 py-6 text-center">

              <p className="text-sm font-medium text-gray-600">
                No vehicle found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try another vehicle number or name.
              </p>

            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">

              {filteredVehicles.map((vehicle) => {
                const isSelected =
                  String(vehicle.id) === String(value);

                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() =>
                      handleSelect(vehicle)
                    }
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition ${
                      isSelected
                        ? "bg-emerald-50"
                        : "hover:bg-emerald-50/60"
                    }`}
                  >

                    {/* Vehicle Icon */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Car size={17} />
                    </div>

                    {/* Vehicle Details */}

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-gray-800">
                        {vehicle.vehicle_number}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {vehicle.vehicle_name ||
                          "Unnamed Vehicle"}
                      </p>

                    </div>

                    {/* Selected */}

                    {isSelected && (
                      <Check
                        size={17}
                        className="shrink-0 text-emerald-600"
                      />
                    )}

                  </button>
                );
              })}

            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default VehicleSelect;