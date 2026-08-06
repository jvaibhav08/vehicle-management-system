const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");
const { addVehicle,getVehicles,getVehicle, updateVehicle, deleteVehicle} = require("../controllers/vehicle.controller");

const router = express.Router();

router.post("/", authenticateUser, addVehicle);

router.get("/", authenticateUser, getVehicles);

router.get("/:id", authenticateUser, getVehicle);  

router.patch("/:id", authenticateUser, updateVehicle);

router.delete("/:id", authenticateUser, deleteVehicle);

module.exports = router;
