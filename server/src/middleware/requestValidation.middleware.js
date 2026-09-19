const AppError = require("../utils/AppError");

const ID_PATTERN = /^[1-9]\d{0,9}$/;
const OTP_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DOCUMENT_MIME_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const DOCUMENT_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

const fail = (message) => {
    throw new AppError(message, 400);
};

const requirePlainObject = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        fail("Request body must be an object");
    }
};

const rejectUnknownFields = (body, allowedFields) => {
    requirePlainObject(body);

    if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
        fail("Request contains unsupported fields");
    }
};

const requireString = (value, field, min, max, pattern) => {
    if (typeof value !== "string") {
        fail(`${field} is required`);
    }

    const normalized = value.trim();

    if (normalized.length < min || normalized.length > max ||
        (pattern && !pattern.test(normalized))) {
        fail(`Invalid ${field.toLowerCase()}`);
    }

    return normalized;
};

const requireId = (value, field = "ID") =>
    requireString(String(value || ""), field, 1, 10, ID_PATTERN);

const requireDate = (value, field) => {
    const date = requireString(value, field, 10, 10, DATE_PATTERN);
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date) {
        fail(`Invalid ${field.toLowerCase()}`);
    }

    return date;
};

const requireBoolean = (value, field) => {
    if (value === true || value === "true") {
        return true;
    }

    if (value === false || value === "false") {
        return false;
    }

    fail(`Invalid ${field.toLowerCase()}`);
};

const validateNoQueryParameters = (req, res, next) => {
    try {
        if (Object.keys(req.query || {}).length > 0) {
            fail("Query parameters are not supported for this endpoint");
        }
        next();
    } catch (error) {
        next(error);
    }
};

const validateNoBodyFields = (req, res, next) => {
    try {
        rejectUnknownFields(req.body || {}, []);
        next();
    } catch (error) {
        next(error);
    }
};

const validateIdParameter = (name) => (req, res, next) => {
    try {
        requireId(req.params[name], name);
        next();
    } catch (error) {
        next(error);
    }
};

const validateRegistration = (req, res, next) => {
    try {
        const body = req.body;
        rejectUnknownFields(body, ["name", "email", "phone", "password", "confirmPassword"]);
        body.name = requireString(body.name, "Name", 1, 100);
        body.password = requireString(body.password, "Password", 6, 128);

        if (body.confirmPassword !== undefined && body.confirmPassword !== body.password) {
            fail("Passwords do not match");
        }

        if (!body.email && !body.phone) {
            fail("Email or phone number is required");
        }

        if (body.email) {
            body.email = requireString(body.email, "Email", 3, 254, EMAIL_PATTERN).toLowerCase();
        }
        if (body.phone) {
            body.phone = requireString(body.phone, "Phone number", 8, 15, PHONE_PATTERN);
        }
        next();
    } catch (error) {
        next(error);
    }
};

const validateLogin = (req, res, next) => {
    try {
        const body = req.body;
        rejectUnknownFields(body, ["email", "password", "trustedDeviceToken"]);
        body.email = requireString(body.email, "Email", 3, 254, EMAIL_PATTERN).toLowerCase();
        body.password = requireString(body.password, "Password", 6, 128);
        if (body.trustedDeviceToken !== undefined && body.trustedDeviceToken !== null) {
            body.trustedDeviceToken = requireString(body.trustedDeviceToken, "Trusted device token", 1, 4096);
        }
        next();
    } catch (error) {
        next(error);
    }
};

const validateEmailOtpVerification = (req, res, next) => {
    try {
        const body = req.body;
        rejectUnknownFields(body, ["email", "otp", "purpose"]);
        body.email = requireString(body.email, "Email", 3, 254, EMAIL_PATTERN).toLowerCase();
        body.otp = requireString(body.otp, "OTP", 6, 6, OTP_PATTERN);
        if (body.purpose !== undefined && !["email_verification", "login"].includes(body.purpose)) {
            fail("Invalid OTP purpose");
        }
        next();
    } catch (error) {
        next(error);
    }
};

const validatePhoneOtpSend = (req, res, next) => {
    try {
        const body = req.body;
        rejectUnknownFields(body, ["userId", "phone"]);
        body.userId = requireId(body.userId, "User ID");
        body.phone = requireString(body.phone, "Phone number", 8, 15, PHONE_PATTERN);
        next();
    } catch (error) {
        next(error);
    }
};

const validatePhoneOtpVerification = (req, res, next) => {
    try {
        const body = req.body;
        rejectUnknownFields(body, ["phone", "otp"]);
        body.phone = requireString(body.phone, "Phone number", 8, 15, PHONE_PATTERN);
        body.otp = requireString(body.otp, "OTP", 6, 6, OTP_PATTERN);
        next();
    } catch (error) {
        next(error);
    }
};

const validateVehicleBody = (isUpdate) => (req, res, next) => {
    try {
        const body = req.body;
        const fields = ["vehicle_number", "vehicle_name", "vehicle_type", "registration_date", "rc_status"];
        rejectUnknownFields(body, fields);
        if (isUpdate && Object.keys(body).length === 0) {
            fail("No update data provided");
        }
        if (!isUpdate || body.vehicle_number !== undefined) {
            body.vehicle_number = requireString(body.vehicle_number, "Vehicle number", 8, 16, /^[A-Za-z0-9]+$/).toUpperCase();
        }
        if (!isUpdate || body.vehicle_name !== undefined) {
            body.vehicle_name = requireString(body.vehicle_name, "Vehicle name", 1, 100);
        }
        if (!isUpdate || body.vehicle_type !== undefined) {
            body.vehicle_type = requireString(body.vehicle_type, "Vehicle type", 1, 20);
            if (!["Four Wheeler", "Two Wheeler", "Commercial", "Other"].includes(body.vehicle_type)) fail("Invalid vehicle type");
        }
        if (!isUpdate || body.registration_date !== undefined) body.registration_date = requireDate(body.registration_date, "Registration date");
        if (!isUpdate || body.rc_status !== undefined) {
            body.rc_status = requireString(body.rc_status, "RC status", 1, 10);
            if (!["Pending", "Received"].includes(body.rc_status)) fail("Invalid RC status");
        }
        next();
    } catch (error) {
        next(error);
    }
};

const validatePucBody = (isUpdate) => (req, res, next) => {
    try {
        const fields = isUpdate ? ["certificate_number", "expiry_date"] : ["vehicle_id", "certificate_number", "expiry_date"];
        const body = req.body;
        rejectUnknownFields(body, fields);
        if (!isUpdate) body.vehicle_id = requireId(body.vehicle_id, "Vehicle ID");
        body.certificate_number = requireString(body.certificate_number, "Certificate number", 1, 100, /^[A-Za-z0-9./_-]+$/);
        body.expiry_date = requireDate(body.expiry_date, "Expiry date");
        next();
    } catch (error) {
        next(error);
    }
};

const validateInsuranceBody = (isUpdate) => (req, res, next) => {
    try {
        const fields = isUpdate
            ? ["insurance_company", "policy_number", "expiry_date", "covers_own_damage", "covers_third_party"]
            : ["vehicle_id", "insurance_company", "policy_number", "expiry_date", "covers_own_damage", "covers_third_party"];
        const body = req.body;
        rejectUnknownFields(body, fields);
        if (!isUpdate) body.vehicle_id = requireId(body.vehicle_id, "Vehicle ID");
        body.insurance_company = requireString(body.insurance_company, "Insurance company", 1, 100);
        body.policy_number = requireString(body.policy_number, "Policy number", 1, 100, /^[A-Za-z0-9./_-]+$/);
        body.expiry_date = requireDate(body.expiry_date, "Expiry date");
        body.covers_own_damage = requireBoolean(body.covers_own_damage, "Own damage coverage");
        body.covers_third_party = requireBoolean(body.covers_third_party, "Third party coverage");
        if (!body.covers_own_damage && !body.covers_third_party) fail("At least one insurance coverage must be selected");
        next();
    } catch (error) {
        next(error);
    }
};

const validateDocumentUpload = (fieldName) => (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }
        if (typeof req.file.originalname !== "string") {
            fail("Invalid document upload");
        }
        const extension = req.file.originalname.slice(req.file.originalname.lastIndexOf(".")).toLowerCase();
        if (req.file.fieldname !== fieldName || req.file.originalname.length === 0 || req.file.originalname.length > 120 ||
            !DOCUMENT_MIME_TYPES.has(req.file.mimetype) || !DOCUMENT_EXTENSIONS.has(extension) ||
            !Number.isInteger(req.file.size) || req.file.size < 1 || req.file.size > 5 * 1024 * 1024) {
            fail("Invalid document upload");
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateNoQueryParameters,
    validateNoBodyFields,
    validateIdParameter,
    validateRegistration,
    validateLogin,
    validateEmailOtpVerification,
    validatePhoneOtpSend,
    validatePhoneOtpVerification,
    validateVehicleCreate: validateVehicleBody(false),
    validateVehicleUpdate: validateVehicleBody(true),
    validatePucCreate: validatePucBody(false),
    validatePucUpdate: validatePucBody(true),
    validateInsuranceCreate: validateInsuranceBody(false),
    validateInsuranceUpdate: validateInsuranceBody(true),
    validateDocumentUpload
};
