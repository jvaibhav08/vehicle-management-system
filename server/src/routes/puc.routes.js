const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const {
    addPuc,
    getPuc,
    getPucById,
    getAllPuc,
    updatePuc,
    getPucDocument,
    deletePucDocument
} = require("../controllers/puc.controller");
const { uploadPucDocument } = require("../middleware/pucDocument.middleware");
const {
    validateNoQueryParameters,
    validateIdParameter,
    validatePucCreate,
    validatePucUpdate,
    validateDocumentUpload
} = require("../middleware/requestValidation.middleware");

const router = express.Router();

router.post("/", authenticateUser, validateNoQueryParameters, uploadPucDocument, validateDocumentUpload("document"), validatePucCreate, addPuc);
router.get("/", authenticateUser, validateNoQueryParameters, getAllPuc);
router.get("/certificate/:pucId", authenticateUser, validateNoQueryParameters, validateIdParameter("pucId"), getPucById);
router.get("/:pucId/document", authenticateUser, validateNoQueryParameters, validateIdParameter("pucId"), getPucDocument);
router.get("/:vehicleId", authenticateUser, validateNoQueryParameters, validateIdParameter("vehicleId"), getPuc);
router.put("/:pucId", authenticateUser, validateNoQueryParameters, validateIdParameter("pucId"), uploadPucDocument, validateDocumentUpload("document"), validatePucUpdate, updatePuc);
router.delete("/:pucId/document", authenticateUser, validateNoQueryParameters, validateIdParameter("pucId"), deletePucDocument);

module.exports = router;
