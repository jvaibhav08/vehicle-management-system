import { useEffect, useMemo, useState } from "react";

import {
  Download,
  FileText,
  Search,
  ShieldCheck,
  ChevronRight,
  X,
  Car,
  FileCheck,
  CalendarDays,
  History,
} from "lucide-react";

import * as XLSX from "xlsx";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
} from "docx";

import { getVehicleReport } from "../../services/reports.service";
import { useToast } from "../../context/ToastContext";

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }) {
  const config = {
    valid: {
      label: "Valid",
      className:
        "border border-emerald-100 bg-emerald-50 text-emerald-600",
    },

    expiringSoon: {
      label: "Expiring Soon",
      className:
        "border border-amber-100 bg-amber-50 text-amber-600",
    },

    expired: {
      label: "Expired",
      className:
        "border border-red-100 bg-red-50 text-red-600",
    },

    pending: {
      label: "Pending",
      className:
        "border border-red-100 bg-red-50 text-red-600",
    },

    noPuc: {
      label: "No PUC",
      className:
        "border border-gray-200 bg-gray-100 text-gray-600",
    },

    Received: {
      label: "Received",
      className:
        "border border-emerald-100 bg-emerald-50 text-emerald-600",
    },

    Pending: {
      label: "Pending",
      className:
        "border border-amber-100 bg-amber-50 text-amber-600",
    },
  };

  const current = config[status] || {
    label: status || "—",
    className:
      "border border-gray-200 bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-GB");
}

// ======================================================
// INSURANCE TYPE
// ======================================================

function formatInsuranceType(type) {
  if (!type) {
    return "—";
  }

  const labels = {
    own_damage: "First Party",
    third_party: "Third Party",
    comprehensive: "Comprehensive",
  };

  return (
    labels[type] ||
    type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
}

// ======================================================
// GET POLICY BY TYPE
// ======================================================

function getPolicyByType(policies, type) {
  return (
    policies?.find(
      (policy) =>
        policy.insurance_type === type
    ) || null
  );
}

// ======================================================
// REPORTS
// ======================================================

function Reports() {
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [insuranceFilter, setInsuranceFilter] =
    useState("all");
  const [pucFilter, setPucFilter] =
    useState("all");
  const [rcFilter, setRcFilter] =
    useState("all");

  const [selectedVehicle, setSelectedVehicle] =
    useState(null);

  // ====================================================
  // FETCH REPORT
  // ====================================================

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response =
          await getVehicleReport();

        if (response.success) {
          setVehicles(response.data || []);
        }
      } catch (error) {
        console.error(error);

        showToast(
            error.response?.data?.message ||
                "Failed to load report data",
            "error"
            );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [showToast]);

  // ====================================================
  // FILTER DATA
  // ====================================================

  const filteredVehicles = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !searchValue ||
        vehicle.vehicleNumber
          ?.toLowerCase()
          .includes(searchValue) ||
        vehicle.vehicleName
          ?.toLowerCase()
          .includes(searchValue) ||
        vehicle.vehicleType
          ?.toLowerCase()
          .includes(searchValue) ||
        vehicle.insuranceStatus
          ?.toLowerCase()
          .includes(searchValue) ||
        vehicle.rcStatus
          ?.toLowerCase()
          .includes(searchValue) ||
        vehicle.currentInsurance?.some(
          (policy) =>
            policy.policy_number
              ?.toLowerCase()
              .includes(searchValue) ||
            policy.insurance_company
              ?.toLowerCase()
              .includes(searchValue)
        ) ||
        vehicle.previousInsurance?.some(
          (policy) =>
            policy.policy_number
              ?.toLowerCase()
              .includes(searchValue) ||
            policy.insurance_company
              ?.toLowerCase()
              .includes(searchValue)
        ) ||
        vehicle.puc?.certificateNumber
          ?.toLowerCase()
          .includes(searchValue);

      const matchesInsurance =
        insuranceFilter === "all" ||
        vehicle.insuranceStatus ===
          insuranceFilter;

      const matchesPuc =
        pucFilter === "all" ||
        vehicle.puc?.status === pucFilter;

      const matchesRc =
        rcFilter === "all" ||
        vehicle.rcStatus === rcFilter;

      return (
        matchesSearch &&
        matchesInsurance &&
        matchesPuc &&
        matchesRc
      );
    });
  }, [
    vehicles,
    search,
    insuranceFilter,
    pucFilter,
    rcFilter,
  ]);

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters = () => {
    setSearch("");
    setInsuranceFilter("all");
    setPucFilter("all");
    setRcFilter("all");
  };

  const hasFilters =
    search.trim() !== "" ||
    insuranceFilter !== "all" ||
    pucFilter !== "all" ||
    rcFilter !== "all";

  // ====================================================
  // BUILD VEHICLE REPORT ROWS
  // ====================================================

  const buildVehicleReportRows = () => {
    return filteredVehicles.map((vehicle) => {
      const currentPolicies =
        vehicle.currentInsurance || [];

      const firstParty = getPolicyByType(
        currentPolicies,
        "own_damage"
      );

      const thirdParty = getPolicyByType(
        currentPolicies,
        "third_party"
      );

      const comprehensive = getPolicyByType(
        currentPolicies,
        "comprehensive"
      );

      return {
        "Vehicle Number":
          vehicle.vehicleNumber || "",

        "Vehicle Name":
          vehicle.vehicleName || "",

        "Vehicle Type":
          vehicle.vehicleType || "",

        "Registration Date":
          formatDate(
            vehicle.registrationDate
          ),

        "RC Status":
          vehicle.rcStatus || "",

        "First Party Company":
          firstParty?.insurance_company || "",

        "First Party Policy":
          firstParty?.policy_number || "",

        "First Party Expiry":
          formatDate(
            firstParty?.expiry_date
          ),

        "Third Party Company":
          thirdParty?.insurance_company || "",

        "Third Party Policy":
          thirdParty?.policy_number || "",

        "Third Party Expiry":
          formatDate(
            thirdParty?.expiry_date
          ),

        "Comprehensive Company":
          comprehensive?.insurance_company ||
          "",

        "Comprehensive Policy":
          comprehensive?.policy_number || "",

        "Comprehensive Expiry":
          formatDate(
            comprehensive?.expiry_date
          ),

        "Insurance Status":
          vehicle.insuranceStatus || "",

        "PUC Certificate":
          vehicle.puc?.certificateNumber ||
          "",

        "PUC Expiry":
          formatDate(
            vehicle.puc?.expiryDate
          ),

        "PUC Status":
          vehicle.puc?.status || "noPuc",
      };
    });
  };

  // ====================================================
  // EXPORT EXCEL REPORT
  // ====================================================

  const exportExcel = () => {
    if (filteredVehicles.length === 0) {
      showToast(
        "There is no data to export.",
        "error"
      );

      return;
    }

    const workbook =
      XLSX.utils.book_new();

    // -----------------------------------------------
    // VEHICLE REPORT
    // -----------------------------------------------

    const vehicleRows =
      buildVehicleReportRows();

    const vehicleSheet =
      XLSX.utils.json_to_sheet(
        vehicleRows
      );

    vehicleSheet["!cols"] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
      { wch: 22 },
      { wch: 25 },
      { wch: 18 },
      { wch: 22 },
      { wch: 25 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 },
      { wch: 18 },
      { wch: 16 },
      { wch: 25 },
      { wch: 18 },
      { wch: 16 },
    ];

    vehicleSheet["!autofilter"] = {
      ref: vehicleSheet["!ref"],
    };

    XLSX.utils.book_append_sheet(
      workbook,
      vehicleSheet,
      "Vehicle Report"
    );

    // -----------------------------------------------
    // INSURANCE HISTORY
    // -----------------------------------------------

    const insuranceRows = [];

    filteredVehicles.forEach((vehicle) => {
      const allInsurance = [
        ...(vehicle.currentInsurance || []),
        ...(vehicle.previousInsurance || []),
      ];

      if (allInsurance.length === 0) {
        insuranceRows.push({
          "Vehicle Number":
            vehicle.vehicleNumber || "",

          "Vehicle Name":
            vehicle.vehicleName || "",

          "Insurance Type":
            "No Insurance",

          Company: "",

          "Policy Number": "",

          "Expiry Date": "",

          Status: "",
        });

        return;
      }

      allInsurance.forEach((policy) => {
        insuranceRows.push({
          "Vehicle Number":
            vehicle.vehicleNumber || "",

          "Vehicle Name":
            vehicle.vehicleName || "",

          "Insurance Type":
            formatInsuranceType(
              policy.insurance_type
            ),

          Company:
            policy.insurance_company || "",

          "Policy Number":
            policy.policy_number || "",

          "Expiry Date":
            formatDate(
              policy.expiry_date
            ),

          Status:
            policy.status === "previous"
              ? "Previous"
              : "Current",
        });
      });
    });

    const insuranceSheet =
      XLSX.utils.json_to_sheet(
        insuranceRows
      );

    insuranceSheet["!cols"] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 28 },
      { wch: 18 },
      { wch: 15 },
    ];

    insuranceSheet["!autofilter"] = {
      ref: insuranceSheet["!ref"],
    };

    XLSX.utils.book_append_sheet(
      workbook,
      insuranceSheet,
      "Insurance History"
    );

    // -----------------------------------------------
    // PUC REPORT
    // -----------------------------------------------

    const pucRows =
      filteredVehicles.map((vehicle) => ({
        "Vehicle Number":
          vehicle.vehicleNumber || "",

        "Vehicle Name":
          vehicle.vehicleName || "",

        "Certificate Number":
          vehicle.puc?.certificateNumber ||
          "",

        "Expiry Date":
          formatDate(
            vehicle.puc?.expiryDate
          ),

        Status:
          vehicle.puc?.status || "noPuc",
      }));

    const pucSheet =
      XLSX.utils.json_to_sheet(
        pucRows
      );

    pucSheet["!cols"] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 28 },
      { wch: 18 },
      { wch: 16 },
    ];

    pucSheet["!autofilter"] = {
      ref: pucSheet["!ref"],
    };

    XLSX.utils.book_append_sheet(
      workbook,
      pucSheet,
      "PUC Report"
    );

    // -----------------------------------------------
    // DOWNLOAD
    // -----------------------------------------------

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    XLSX.writeFile(
      workbook,
      `vehicle-report-${date}.xlsx`
    );

    showToast(
      "Excel report exported successfully",
      "success"
    );
  };

  // ====================================================
  // EXPORT CSV
  // ====================================================

  const exportCSV = () => {
    if (filteredVehicles.length === 0) {
      showToast(
        
        "There is no data to export.",
        "error"
      );

      return;
    }

    const rows =
      buildVehicleReportRows();

    const headers =
      Object.keys(rows[0]);

    const escapeCSV = (value) => {
      const stringValue =
        value === null ||
        value === undefined
          ? ""
          : String(value);

      return `"${stringValue.replaceAll(
        '"',
        '""'
      )}"`;
    };

    const csv = [
      headers
        .map(escapeCSV)
        .join(","),

      ...rows.map((row) =>
        headers
          .map((header) =>
            escapeCSV(row[header])
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `vehicle-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
        "CSV report exported successfully",
      "success"
      
    );
  };

  // ====================================================
  // EXPORT SINGLE VEHICLE DOCX REPORT
  // ====================================================

  const exportVehicleReport = async (
    vehicle
  ) => {
    try {
      const currentInsurance =
        vehicle.currentInsurance || [];

      const previousInsurance =
        vehicle.previousInsurance || [];

      const puc = vehicle.puc;

      // -----------------------------------------------
      // TABLE CELL HELPER
      // -----------------------------------------------

      const createCell = (
        label,
        value
      ) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                  color: "64748B",
                  size: 18,
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: value || "—",
                  bold: true,
                  color: "1E293B",
                  size: 21,
                }),
              ],
            }),
          ],
        });
      };

      // -----------------------------------------------
      // INSURANCE ROWS
      // -----------------------------------------------

      const insuranceRows =
        currentInsurance.length > 0
          ? currentInsurance.map(
              (policy) =>
                new TableRow({
                  children: [
                    createCell(
                      "Type",
                      formatInsuranceType(
                        policy.insurance_type
                      )
                    ),

                    createCell(
                      "Company",
                      policy.insurance_company
                    ),

                    createCell(
                      "Policy Number",
                      policy.policy_number
                    ),

                    createCell(
                      "Expiry",
                      formatDate(
                        policy.expiry_date
                      )
                    ),
                  ],
                })
            )
          : [
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 4,

                    children: [
                      new Paragraph({
                        alignment:
                          AlignmentType.CENTER,

                        children: [
                          new TextRun({
                            text:
                              "No active insurance policies.",
                            color: "64748B",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ];

      // -----------------------------------------------
      // PREVIOUS INSURANCE ROWS
      // -----------------------------------------------

      const previousInsuranceRows =
        previousInsurance.length > 0
          ? previousInsurance.map(
              (policy) =>
                new TableRow({
                  children: [
                    createCell(
                      "Type",
                      formatInsuranceType(
                        policy.insurance_type
                      )
                    ),

                    createCell(
                      "Company",
                      policy.insurance_company
                    ),

                    createCell(
                      "Policy Number",
                      policy.policy_number
                    ),

                    createCell(
                      "Expiry",
                      formatDate(
                        policy.expiry_date
                      )
                    ),
                  ],
                })
            )
          : [
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 4,

                    children: [
                      new Paragraph({
                        alignment:
                          AlignmentType.CENTER,

                        children: [
                          new TextRun({
                            text:
                              "No previous insurance records.",
                            color: "64748B",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ];

      // -----------------------------------------------
      // DOCUMENT
      // -----------------------------------------------

      const doc =
        new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: {
                    top: 720,
                    bottom: 720,
                    left: 720,
                    right: 720,
                  },
                },
              },

              children: [
                // -------------------------------------
                // HEADER
                // -------------------------------------

                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,

                  children: [
                    new TextRun({
                      text:
                        "VEHICLE MANAGEMENT SYSTEM",
                      bold: true,
                      color: "059669",
                      size: 30,
                    }),
                  ],

                  spacing: {
                    after: 100,
                  },
                }),

                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,

                  children: [
                    new TextRun({
                      text:
                        "VEHICLE REPORT",
                      bold: true,
                      color: "1E293B",
                      size: 32,
                    }),
                  ],

                  spacing: {
                    after: 250,
                  },
                }),

                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,

                  children: [
                    new TextRun({
                      text:
                        vehicle.vehicleNumber ||
                        "Vehicle",
                      bold: true,
                      color: "1E293B",
                      size: 27,
                    }),
                  ],

                  spacing: {
                    after: 50,
                  },
                }),

                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,

                  children: [
                    new TextRun({
                      text:
                        vehicle.vehicleName ||
                        "",
                      color: "64748B",
                      size: 21,
                    }),
                  ],

                  spacing: {
                    after: 350,
                  },
                }),

                // -------------------------------------
                // VEHICLE INFORMATION
                // -------------------------------------

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        "VEHICLE INFORMATION",
                      bold: true,
                      color: "059669",
                      size: 23,
                    }),
                  ],

                  spacing: {
                    after: 120,
                  },
                }),

                new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },

                  rows: [
                    new TableRow({
                      children: [
                        createCell(
                          "Vehicle Number",
                          vehicle.vehicleNumber
                        ),

                        createCell(
                          "Vehicle Type",
                          vehicle.vehicleType
                        ),
                      ],
                    }),

                    new TableRow({
                      children: [
                        createCell(
                          "Registration Date",
                          formatDate(
                            vehicle.registrationDate
                          )
                        ),

                        createCell(
                          "RC Status",
                          vehicle.rcStatus
                        ),
                      ],
                    }),
                  ],
                }),

                new Paragraph({
                  text: "",
                  spacing: {
                    after: 220,
                  },
                }),

                // -------------------------------------
                // DOCUMENT STATUS
                // -------------------------------------

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        "DOCUMENT STATUS",
                      bold: true,
                      color: "059669",
                      size: 23,
                    }),
                  ],

                  spacing: {
                    after: 120,
                  },
                }),

                new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },

                  rows: [
                    new TableRow({
                      children: [
                        createCell(
                          "Insurance Status",
                          vehicle.insuranceStatus
                        ),

                        createCell(
                          "PUC Status",
                          puc?.status === "noPuc"
                            ? "No PUC"
                            : puc?.status
                        ),
                      ],
                    }),
                  ],
                }),

                new Paragraph({
                  text: "",
                  spacing: {
                    after: 220,
                  },
                }),

                // -------------------------------------
                // CURRENT INSURANCE
                // -------------------------------------

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        "CURRENT INSURANCE",
                      bold: true,
                      color: "059669",
                      size: 23,
                    }),
                  ],

                  spacing: {
                    after: 120,
                  },
                }),

                new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },

                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Insurance Type",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),

                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Company",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),

                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Policy Number",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),

                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Expiry",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),

                    ...insuranceRows,
                  ],
                }),

                new Paragraph({
                  text: "",
                  spacing: {
                    after: 220,
                  },
                }),

                // -------------------------------------
                // PUC
                // -------------------------------------

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        "PUC DETAILS",
                      bold: true,
                      color: "059669",
                      size: 23,
                    }),
                  ],

                  spacing: {
                    after: 120,
                  },
                }),

                new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },

                  rows: [
                    new TableRow({
                      children: [
                        createCell(
                          "Certificate Number",
                          puc?.certificateNumber
                        ),

                        createCell(
                          "Expiry Date",
                          formatDate(
                            puc?.expiryDate
                          )
                        ),
                      ],
                    }),
                  ],
                }),

                new Paragraph({
                  text: "",
                  spacing: {
                    after: 220,
                  },
                }),

                // -------------------------------------
                // PREVIOUS INSURANCE
                // -------------------------------------

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        "PREVIOUS INSURANCE",
                      bold: true,
                      color: "64748B",
                      size: 23,
                    }),
                  ],

                  spacing: {
                    after: 120,
                  },
                }),

                new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },

                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Insurance Type",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),

                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Company",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),

                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Policy Number",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),

                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text:
                                    "Expiry",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),

                    ...previousInsuranceRows,
                  ],
                }),

                new Paragraph({
                  text: "",
                  spacing: {
                    after: 300,
                  },
                }),

                // -------------------------------------
                // FOOTER
                // -------------------------------------

                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,

                  children: [
                    new TextRun({
                      text:
                        `Report generated on ${formatDate(
                          new Date()
                        )}`,
                      color: "94A3B8",
                      size: 18,
                    }),
                  ],
                }),
              ],
            },
          ],
        });

      // -----------------------------------------------
      // CREATE FILE
      // -----------------------------------------------

      const blob =
        await Packer.toBlob(doc);

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${vehicle.vehicleNumber}-vehicle-report.docx`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      showToast(
        
        "Vehicle report exported successfully",
        "success"
      );
    } catch (error) {
      console.error(
        "Vehicle report export error:",
        error
      );

      showToast(
        
        "Failed to export vehicle report",
        "error"
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <>
      <div className="p-6 lg:p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Complete vehicle and document report.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={exportCSV}
              disabled={
                filteredVehicles.length === 0
              }
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText size={17} />
              CSV
            </button>

            <button
              type="button"
              onClick={exportExcel}
              disabled={
                filteredVehicles.length === 0
              }
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Export Report
            </button>

          </div>

        </div>

        {/* ==================================================
            FILTER CARD
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search vehicles, policy numbers, companies..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}

          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">

            {/* INSURANCE */}

            <div className="flex items-center gap-2">

              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Insurance
              </label>

              <select
                value={insuranceFilter}
                onChange={(e) =>
                  setInsuranceFilter(
                    e.target.value
                  )
                }
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">
                  All
                </option>

                <option value="valid">
                  Valid
                </option>

                <option value="expiringSoon">
                  Expiring Soon
                </option>

                <option value="expired">
                  Expired
                </option>

                <option value="pending">
                  Pending
                </option>
              </select>

            </div>

            {/* PUC */}

            <div className="flex items-center gap-2">

              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                PUC
              </label>

              <select
                value={pucFilter}
                onChange={(e) =>
                  setPucFilter(
                    e.target.value
                  )
                }
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">
                  All
                </option>

                <option value="valid">
                  Valid
                </option>

                <option value="expiringSoon">
                  Expiring Soon
                </option>

                <option value="expired">
                  Expired
                </option>

                <option value="noPuc">
                  No PUC
                </option>
              </select>

            </div>

            {/* RC */}

            <div className="flex items-center gap-2">

              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                RC
              </label>

              <select
                value={rcFilter}
                onChange={(e) =>
                  setRcFilter(
                    e.target.value
                  )
                }
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">
                  All
                </option>

                <option value="Received">
                  Received
                </option>

                <option value="Pending">
                  Pending
                </option>
              </select>

            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={15} />
                Clear Filters
              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="mb-4 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <FileText
              size={17}
              className="text-emerald-600"
            />

            <p className="text-sm font-medium text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {filteredVehicles.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {vehicles.length}
              </span>{" "}
              vehicles
            </p>

          </div>

        </div>

        {/* ==================================================
            REPORT TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Vehicle
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Registration
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Insurance
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    PUC
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    RC
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Details
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredVehicles.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >

                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                          <Search size={22} />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                          No vehicles found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your search or filters.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredVehicles.map(
                    (vehicle) => (

                      <tr
                        key={vehicle.vehicleId}
                        className="border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50"
                      >

                        {/* VEHICLE */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <Car size={19} />
                            </div>

                            <div>

                              <p className="font-semibold text-gray-800">
                                {vehicle.vehicleNumber}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {vehicle.vehicleName ||
                                  "—"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* REGISTRATION */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-gray-600">

                            <CalendarDays
                              size={15}
                              className="text-gray-400"
                            />

                            {formatDate(
                              vehicle.registrationDate
                            )}

                          </div>

                          <p className="mt-1 text-xs text-gray-400">
                            {vehicle.vehicleType ||
                              "—"}
                          </p>

                        </td>

                        {/* INSURANCE */}

                        <td className="px-5 py-5">

                          <StatusBadge
                            status={
                              vehicle.insuranceStatus
                            }
                          />

                          {vehicle.currentInsurance
                            ?.length > 0 && (
                            <p className="mt-2 text-xs text-gray-400">
                              {
                                vehicle
                                  .currentInsurance
                                  .length
                              }{" "}
                              active polic
                              {vehicle
                                .currentInsurance
                                .length === 1
                                ? "y"
                                : "ies"}
                            </p>
                          )}

                        </td>

                        {/* PUC */}

                        <td className="px-5 py-5">

                          <StatusBadge
                            status={
                              vehicle.puc?.status
                            }
                          />

                          {vehicle.puc
                            ?.expiryDate && (
                            <p className="mt-2 text-xs text-gray-400">
                              Expiry:{" "}
                              {formatDate(
                                vehicle.puc
                                  .expiryDate
                              )}
                            </p>
                          )}

                        </td>

                        {/* RC */}

                        <td className="px-5 py-5">

                          <StatusBadge
                            status={
                              vehicle.rcStatus
                            }
                          />

                        </td>

                        {/* DETAILS */}

                        <td className="px-5 py-5 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVehicle(
                                vehicle
                              )
                            }
                            className="mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                            title="View report details"
                          >
                            <ChevronRight
                              size={18}
                            />
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ==================================================
          VEHICLE DETAILS DRAWER
      ================================================== */}

      {selectedVehicle && (
        <>

          {/* BACKDROP */}

          <div
            className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-[1px]"
            onClick={() =>
              setSelectedVehicle(null)
            }
          />

          {/* DRAWER */}

          <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col bg-white shadow-2xl">

            {/* DRAWER HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Car size={21} />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-800">
                    {selectedVehicle.vehicleNumber}
                  </h2>

                  <p className="text-sm text-gray-400">
                    {selectedVehicle.vehicleName ||
                      "Vehicle Report"}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVehicle(null)
                }
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={19} />
              </button>

            </div>

            {/* DRAWER CONTENT */}

            <div className="flex-1 overflow-y-auto p-6">

              {/* VEHICLE INFORMATION */}

              <section className="mb-6">

                <div className="mb-3 flex items-center gap-2">

                  <Car
                    size={17}
                    className="text-emerald-600"
                  />

                  <h3 className="text-sm font-semibold text-gray-800">
                    Vehicle Information
                  </h3>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      Vehicle Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {selectedVehicle.vehicleNumber}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      Vehicle Type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {selectedVehicle.vehicleType ||
                        "—"}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      Registration Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {formatDate(
                        selectedVehicle.registrationDate
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      RC Status
                    </p>

                    <div className="mt-1">
                      <StatusBadge
                        status={
                          selectedVehicle.rcStatus
                        }
                      />
                    </div>

                  </div>

                </div>

              </section>

              {/* CURRENT INSURANCE */}

              <section className="mb-6">

                <div className="mb-3 flex items-center gap-2">

                  <ShieldCheck
                    size={17}
                    className="text-emerald-600"
                  />

                  <h3 className="text-sm font-semibold text-gray-800">
                    Current Insurance
                  </h3>

                </div>

                {selectedVehicle
                  .currentInsurance
                  ?.length > 0 ? (

                  <div className="space-y-3">

                    {selectedVehicle.currentInsurance.map(
                      (policy) => (

                        <div
                          key={policy.id}
                          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="text-sm font-semibold text-gray-700">
                                {policy.insurance_company ||
                                  "—"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {formatInsuranceType(
                                  policy.insurance_type
                                )}
                              </p>

                            </div>

                            <StatusBadge
                              status={
                                selectedVehicle.insuranceStatus
                              }
                            />

                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">

                            <div>

                              <p className="text-xs text-gray-400">
                                Policy Number
                              </p>

                              <p className="mt-1 break-all text-sm font-medium text-gray-700">
                                {policy.policy_number ||
                                  "—"}
                              </p>

                            </div>

                            <div>

                              <p className="text-xs text-gray-400">
                                Expiry Date
                              </p>

                              <p className="mt-1 text-sm font-medium text-gray-700">
                                {formatDate(
                                  policy.expiry_date
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">

                    <ShieldCheck
                      size={24}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-2 text-sm text-gray-400">
                      No active insurance policies.
                    </p>

                  </div>

                )}

              </section>

              {/* PUC */}

              <section className="mb-6">

                <div className="mb-3 flex items-center gap-2">

                  <FileCheck
                    size={17}
                    className="text-emerald-600"
                  />

                  <h3 className="text-sm font-semibold text-gray-800">
                    PUC Details
                  </h3>

                </div>

                {selectedVehicle.puc?.id ? (

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs text-gray-400">
                          Certificate Number
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {selectedVehicle.puc
                            .certificateNumber ||
                            "—"}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          selectedVehicle.puc
                            .status
                        }
                      />

                    </div>

                    <div className="mt-4">

                      <p className="text-xs text-gray-400">
                        Expiry Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {formatDate(
                          selectedVehicle.puc
                            .expiryDate
                        )}
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">

                    <FileCheck
                      size={24}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-2 text-sm text-gray-400">
                      No PUC certificate available.
                    </p>

                  </div>

                )}

              </section>

              {/* PREVIOUS INSURANCE */}

              <section>

                <div className="mb-3 flex items-center gap-2">

                  <History
                    size={17}
                    className="text-gray-500"
                  />

                  <h3 className="text-sm font-semibold text-gray-800">
                    Insurance History
                  </h3>

                </div>

                {selectedVehicle
                  .previousInsurance
                  ?.length > 0 ? (

                  <div className="space-y-3">

                    {selectedVehicle.previousInsurance.map(
                      (policy) => (

                        <div
                          key={policy.id}
                          className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        >

                          <div className="flex items-start justify-between">

                            <div>

                              <p className="text-sm font-semibold text-gray-700">
                                {policy.insurance_company ||
                                  "—"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {formatInsuranceType(
                                  policy.insurance_type
                                )}
                              </p>

                            </div>

                            <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-500">
                              Previous
                            </span>

                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">

                            <div>

                              <p className="text-xs text-gray-400">
                                Policy Number
                              </p>

                              <p className="mt-1 break-all text-sm text-gray-700">
                                {policy.policy_number ||
                                  "—"}
                              </p>

                            </div>

                            <div>

                              <p className="text-xs text-gray-400">
                                Expiry Date
                              </p>

                              <p className="mt-1 text-sm text-gray-700">
                                {formatDate(
                                  policy.expiry_date
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">

                    <History
                      size={24}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-2 text-sm text-gray-400">
                      No previous insurance records.
                    </p>

                  </div>

                )}

              </section>

            </div>

            {/* ==================================================
                DRAWER FOOTER
            ================================================== */}

            <div className="border-t border-gray-100 bg-white p-4">

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    exportVehicleReport(
                      selectedVehicle
                    )
                  }
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700"
                >
                  <Download size={17} />
                  Export Vehicle Report
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedVehicle(null)
                  }
                  className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Close
                </button>

              </div>

            </div>

          </aside>

        </>
      )}
    </>
  );
}

export default Reports;