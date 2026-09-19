const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const AppError = require("./utils/AppError");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const pucRoutes = require("./routes/puc.routes");
const insuranceRoutes = require("./routes/insurance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportsRoutes = require("./routes/reports.routes");

const verificationRoutes = require("./routes/verification.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const developmentOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
];
const allowedOrigins = new Set(
    isProduction ? configuredOrigins : [...configuredOrigins, ...developmentOrigins]
);


// ======================================================
// MIDDLEWARE
// ======================================================

app.disable("x-powered-by");

app.use(helmet({
    // The API serves authenticated document downloads to configured frontend origins.
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: (origin, callback) => {
        // Requests without an Origin header are non-browser requests.
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new AppError("Origin not allowed", 403));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
    maxAge: 600,
    optionsSuccessStatus: 204
}));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 50 }));


// ======================================================
// ROUTE REGISTRATION
// ======================================================

// Authentication routes
app.use("/api/auth", authRoutes);

// Email & Phone verification routes
app.use("/api/auth", verificationRoutes);

// Vehicle routes
app.use("/api/vehicles", vehicleRoutes);

// PUC routes
app.use("/api/puc", pucRoutes);

// Insurance routes
app.use("/api/insurance", insuranceRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Reports routes
app.use("/api/reports", reportsRoutes);


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "vehicle management app is running"
    });

});


// ======================================================
// GLOBAL ERROR HANDLER
// Keep this AFTER all application routes.
// ======================================================

app.use(errorHandler);


// ======================================================
// EXPORT APP
// ======================================================

module.exports = app;
