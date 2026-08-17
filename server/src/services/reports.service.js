const reportsModel = require("../models/reports.model");

// ======================================================
// INSURANCE STATUS CONSTANTS
// ======================================================

const INSURANCE_STATUS = Object.freeze({
    VALID: "valid",
    PENDING: "pending",
    EXPIRING_SOON: "expiringSoon",
    EXPIRED: "expired"
});

// ======================================================
// INSURANCE REASON CODES
// ======================================================

const INSURANCE_REASONS = Object.freeze({
    NO_INSURANCE: "no_insurance",
    THIRD_PARTY_MISSING: "third_party_missing",
    OWN_DAMAGE_MISSING: "own_damage_missing",
    THIRD_PARTY_EXPIRED: "third_party_expired",
    OWN_DAMAGE_EXPIRED: "own_damage_expired",
    COMPREHENSIVE_EXPIRED: "comprehensive_expired"
});

// ======================================================
// GET EXPIRY STATUS
// ======================================================

const getExpiryStatus = (
    expiryDate,
    today,
    thirtyDaysLater
) => {

    const expiry = new Date(expiryDate);

    const expiryUTC = new Date(
        Date.UTC(
            expiry.getFullYear(),
            expiry.getMonth(),
            expiry.getDate()
        )
    );

    if (expiryUTC < today) {
        return INSURANCE_STATUS.EXPIRED;
    }

    if (expiryUTC <= thirtyDaysLater) {
        return INSURANCE_STATUS.EXPIRING_SOON;
    }

    return INSURANCE_STATUS.VALID;
};

// ======================================================
// FIND ACTIVE POLICIES
// ======================================================

const findPolicies = (insuranceRecords) => {

    let comprehensive = null;
    let thirdParty = null;
    let ownDamage = null;

    for (const insurance of insuranceRecords) {

        if (
            insurance.insurance_type ===
            "comprehensive"
        ) {
            comprehensive = insurance;
        }

        if (
            insurance.insurance_type ===
            "third_party"
        ) {
            thirdParty = insurance;
        }

        if (
            insurance.insurance_type ===
            "own_damage"
        ) {
            ownDamage = insurance;
        }
    }

    return {
        comprehensive,
        thirdParty,
        ownDamage
    };
};

// ======================================================
// EVALUATE INSURANCE HEALTH
// Same logic as Dashboard
// ======================================================

const evaluateInsuranceHealth = (
    insuranceRecords
) => {

    const now = new Date();

    const today = new Date(
        Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        )
    );

    const thirtyDaysLater =
        new Date(today);

    thirtyDaysLater.setUTCDate(
        thirtyDaysLater.getUTCDate() + 30
    );

    const {
        comprehensive,
        thirdParty,
        ownDamage
    } = findPolicies(insuranceRecords);

    // --------------------------------------------------
    // COMPREHENSIVE
    // --------------------------------------------------

    if (comprehensive) {

        const comprehensiveStatus =
            getExpiryStatus(
                comprehensive.expiry_date,
                today,
                thirtyDaysLater
            );

        if (
            comprehensiveStatus ===
            INSURANCE_STATUS.VALID
        ) {
            return {
                status:
                    INSURANCE_STATUS.VALID
            };
        }

        if (
            comprehensiveStatus ===
            INSURANCE_STATUS.EXPIRING_SOON
        ) {
            return {
                status:
                    INSURANCE_STATUS.EXPIRING_SOON
            };
        }

        return {
            status:
                INSURANCE_STATUS.EXPIRED,

            reason:
                INSURANCE_REASONS.COMPREHENSIVE_EXPIRED
        };
    }

    // --------------------------------------------------
    // NO INSURANCE
    // --------------------------------------------------

    if (
        !thirdParty &&
        !ownDamage
    ) {
        return {
            status:
                INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.NO_INSURANCE
        };
    }

    // --------------------------------------------------
    // THIRD PARTY MISSING
    // --------------------------------------------------

    if (!thirdParty) {
        return {
            status:
                INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.THIRD_PARTY_MISSING
        };
    }

    // --------------------------------------------------
    // OWN DAMAGE MISSING
    // --------------------------------------------------

    if (!ownDamage) {
        return {
            status:
                INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.OWN_DAMAGE_MISSING
        };
    }

    // --------------------------------------------------
    // CHECK EXPIRY
    // --------------------------------------------------

    const thirdPartyStatus =
        getExpiryStatus(
            thirdParty.expiry_date,
            today,
            thirtyDaysLater
        );

    const ownDamageStatus =
        getExpiryStatus(
            ownDamage.expiry_date,
            today,
            thirtyDaysLater
        );

    // --------------------------------------------------
    // THIRD PARTY EXPIRED
    // --------------------------------------------------

    if (
        thirdPartyStatus ===
        INSURANCE_STATUS.EXPIRED
    ) {
        return {
            status:
                INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.THIRD_PARTY_EXPIRED
        };
    }

    // --------------------------------------------------
    // OWN DAMAGE EXPIRED
    // --------------------------------------------------

    if (
        ownDamageStatus ===
        INSURANCE_STATUS.EXPIRED
    ) {
        return {
            status:
                INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.OWN_DAMAGE_EXPIRED
        };
    }

    // --------------------------------------------------
    // EXPIRING SOON
    // --------------------------------------------------

    if (
        thirdPartyStatus ===
            INSURANCE_STATUS.EXPIRING_SOON
        ||
        ownDamageStatus ===
            INSURANCE_STATUS.EXPIRING_SOON
    ) {
        return {
            status:
                INSURANCE_STATUS.EXPIRING_SOON
        };
    }

    // --------------------------------------------------
    // FULLY INSURED
    // --------------------------------------------------

    return {
        status:
            INSURANCE_STATUS.VALID
    };
};

// ======================================================
// GET PUC STATUS
// ======================================================

const getPucStatus = (pucRecord) => {

    // --------------------------------------------------
    // NO PUC
    // --------------------------------------------------

    if (!pucRecord) {
        return "noPuc";
    }

    const now = new Date();

    const today = new Date(
        Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        )
    );

    const thirtyDaysLater =
        new Date(today);

    thirtyDaysLater.setUTCDate(
        thirtyDaysLater.getUTCDate() + 30
    );

    const expiry = new Date(
        pucRecord.expiry_date
    );

    const expiryUTC = new Date(
        Date.UTC(
            expiry.getFullYear(),
            expiry.getMonth(),
            expiry.getDate()
        )
    );

    if (expiryUTC < today) {
        return "expired";
    }

    if (expiryUTC <= thirtyDaysLater) {
        return "expiringSoon";
    }

    return "valid";
};

// ======================================================
// GROUP INSURANCE BY VEHICLE
// ======================================================

const groupInsuranceByVehicle = (
    insuranceRecords
) => {

    const insuranceMap = new Map();

    for (
        const insurance of insuranceRecords
    ) {

        if (
            !insuranceMap.has(
                insurance.vehicle_id
            )
        ) {
            insuranceMap.set(
                insurance.vehicle_id,
                []
            );
        }

        insuranceMap
            .get(insurance.vehicle_id)
            .push(insurance);
    }

    return insuranceMap;
};

// ======================================================
// GROUP PUC BY VEHICLE
// ======================================================

const groupPucByVehicle = (
    pucRecords
) => {

    const pucMap = new Map();

    for (const puc of pucRecords) {

        pucMap.set(
            puc.vehicle_id,
            puc
        );
    }

    return pucMap;
};

// ======================================================
// GET VEHICLE REPORT
// ======================================================

const getVehicleReport = async (
    userId
) => {

    const {
        vehicles,
        insurance,
        puc
    } = await reportsModel.getVehicleReportData(
        userId
    );

    const insuranceMap =
        groupInsuranceByVehicle(
            insurance
        );

    const pucMap =
        groupPucByVehicle(
            puc
        );

    // --------------------------------------------------
    // BUILD REPORT
    // --------------------------------------------------

    const report = vehicles.map(
        (vehicle) => {

            const vehicleInsurance =
                insuranceMap.get(
                    vehicle.id
                ) || [];

            const activeInsurance =
                vehicleInsurance.filter(
                    (record) =>
                        record.status ===
                        "active"
                );

            const previousInsurance =
                vehicleInsurance.filter(
                    (record) =>
                        record.status ===
                        "previous"
                );

            const insuranceHealth =
                evaluateInsuranceHealth(
                    activeInsurance
                );

            const pucRecord =
                pucMap.get(
                    vehicle.id
                ) || null;

            const pucStatus =
                getPucStatus(
                    pucRecord
                );

            return {

                vehicleId:
                    vehicle.id,

                vehicleNumber:
                    vehicle.vehicle_number,

                vehicleName:
                    vehicle.vehicle_name,

                vehicleType:
                    vehicle.vehicle_type,

                registrationDate:
                    vehicle.registration_date,

                rcStatus:
                    vehicle.rc_status,

                // --------------------------------------
                // CURRENT INSURANCE
                // --------------------------------------

                currentInsurance:
                    activeInsurance,

                insuranceStatus:
                    insuranceHealth.status,

                insuranceReason:
                    insuranceHealth.reason ||
                    null,

                // --------------------------------------
                // PREVIOUS INSURANCE
                // --------------------------------------

                previousInsurance,

                // --------------------------------------
                // PUC
                // --------------------------------------

                puc:
                    pucRecord
                        ? {
                            id:
                                pucRecord.id,

                            certificateNumber:
                                pucRecord.certificate_number,

                            expiryDate:
                                pucRecord.expiry_date,

                            status:
                                pucStatus
                        }
                        : {
                            id: null,

                            certificateNumber:
                                null,

                            expiryDate:
                                null,

                            status:
                                "noPuc"
                        }
            };
        }
    );

    return report;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getVehicleReport
};