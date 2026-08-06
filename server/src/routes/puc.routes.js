const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const { addPuc, getPuc, getPucById, getAllPuc, updatePuc } = require("../controllers/puc.controller");

const router = express.Router();

router.post("/", authenticateUser, addPuc);
router.get("/", authenticateUser, getAllPuc);
router.get("/certificate/:pucId", authenticateUser, getPucById);
router.get("/:vehicleId", authenticateUser, getPuc);
router.put("/:pucId", authenticateUser, updatePuc);

module.exports = router;