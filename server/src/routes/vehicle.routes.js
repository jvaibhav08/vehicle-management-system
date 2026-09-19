const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");
const { addVehicle,getVehicles,getVehicle, updateVehicle, deleteVehicle} = require("../controllers/vehicle.controller");
const {
    validateNoQueryParameters,
    validateIdParameter,
    validateVehicleCreate,
    validateVehicleUpdate
} = require("../middleware/requestValidation.middleware");

const router = express.Router();

router.post("/", authenticateUser, validateNoQueryParameters, validateVehicleCreate, addVehicle);

router.get("/", authenticateUser, validateNoQueryParameters, getVehicles);

router.get("/:id", authenticateUser, validateNoQueryParameters, validateIdParameter("id"), getVehicle);

router.patch("/:id", authenticateUser, validateNoQueryParameters, validateIdParameter("id"), validateVehicleUpdate, updateVehicle);

router.delete("/:id", authenticateUser, validateNoQueryParameters, validateIdParameter("id"), deleteVehicle);

module.exports = router;
