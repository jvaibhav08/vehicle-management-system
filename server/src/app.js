const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const pucRoutes = require("./routes/puc.routes");
const insuranceRoutes = require("./routes/insurance.routes");

const errorHandler = require("./middleware/error.middleware");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/puc",pucRoutes);
app.use("/api/insurance",insuranceRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "vehicle management app is running"
    });
});

// Global error handler
// Keep this AFTER all application routes.
app.use(errorHandler);

module.exports = app;