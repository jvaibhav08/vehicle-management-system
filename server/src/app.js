const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const pucRoutes = require("./routes/puc.routes");
const insuranceRoutes = require("./routes/insurance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportsRoutes = require("./routes/reports.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// ROUTE REGISTRATION
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/puc", pucRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/dashboard", dashboardRoutes);
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

module.exports = app;