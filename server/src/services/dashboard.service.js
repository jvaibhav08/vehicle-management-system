const dashboardModel = require("../models/dashboard.model");

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
// INSURANCE STATUS
// ======================================================

const INSURANCE_STATUS = Object.freeze({
    VALID: "valid",
    PENDING: "pending",
    EXPIRING_SOON: "expiringSoon",
    EXPIRED: "expired"
});

// ======================================================
// HELPER FUNCTION
// CHECK POLICY EXPIRY STATUS
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
// HELPER FUNCTION
// FIND ACTIVE POLICIES
// ======================================================

const findPolicies = (insuranceRecords) => {

    let comprehensive = null;
    let thirdParty = null;
    let ownDamage = null;

    for (const insurance of insuranceRecords) {

        if (insurance.insurance_type === "comprehensive") {
            comprehensive = insurance;
        }

        if (insurance.insurance_type === "third_party") {
            thirdParty = insurance;
        }

        if (insurance.insurance_type === "own_damage") {
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
// GROUP POLICIES BY VEHICLE
// ======================================================

const groupPoliciesByVehicle = (insuranceRecords) => {

    const vehicles = new Map();

    for (const record of insuranceRecords) {

        if (!vehicles.has(record.vehicle_id)) {
            vehicles.set(record.vehicle_id, []);
        }

        if (record.insurance_type) {
            vehicles
                .get(record.vehicle_id)
                .push(record);
        }
    }

    return vehicles;
};

// ======================================================
// INSURANCE HEALTH ENGINE
// ======================================================

const evaluateInsuranceHealth = (insuranceRecords) => {

    // --------------------------------------------------
    // DATE CONSTANTS
    // --------------------------------------------------

    const now = new Date();

    const today = new Date(
        Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        )
    );

    const thirtyDaysLater = new Date(today);

    thirtyDaysLater.setUTCDate(
        thirtyDaysLater.getUTCDate() + 30
    );

    const {
        comprehensive,
        thirdParty,
        ownDamage
    } = findPolicies(insuranceRecords);

    // --------------------------------------------------
    // COMPREHENSIVE POLICY
    //
    // Comprehensive means full coverage.
    // Its expiry determines the overall vehicle status.
    // --------------------------------------------------

    if (comprehensive) {

        const comprehensiveStatus =
            getExpiryStatus(
                comprehensive.expiry_date,
                today,
                thirtyDaysLater
            );

        // ----------------------------------------------
        // COMPREHENSIVE VALID
        // ----------------------------------------------

        if (
            comprehensiveStatus ===
            INSURANCE_STATUS.VALID
        ) {

            return {
                status: INSURANCE_STATUS.VALID
            };
        }

        // ----------------------------------------------
        // COMPREHENSIVE EXPIRING SOON
        // ----------------------------------------------

        if (
            comprehensiveStatus ===
            INSURANCE_STATUS.EXPIRING_SOON
        ) {

            return {
                status:
                    INSURANCE_STATUS.EXPIRING_SOON
            };
        }

        // ----------------------------------------------
        // COMPREHENSIVE EXPIRED
        // ----------------------------------------------

        return {

            status: INSURANCE_STATUS.EXPIRED,

            reason:
                INSURANCE_REASONS.COMPREHENSIVE_EXPIRED
        };
    }

    // --------------------------------------------------
    // NO INSURANCE
    // --------------------------------------------------

    if (!thirdParty && !ownDamage) {

        return {

            status: INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.NO_INSURANCE
        };
    }

    // --------------------------------------------------
    // THIRD PARTY MISSING
    // --------------------------------------------------

    if (!thirdParty) {

        return {

            status: INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.THIRD_PARTY_MISSING
        };
    }

    // --------------------------------------------------
    // OWN DAMAGE MISSING
    // --------------------------------------------------

    if (!ownDamage) {

        return {

            status: INSURANCE_STATUS.PENDING,

            reason:
                INSURANCE_REASONS.OWN_DAMAGE_MISSING
        };
    }

    // --------------------------------------------------
    // CHECK EXPIRY STATUS
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

            status: INSURANCE_STATUS.PENDING,

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

            status: INSURANCE_STATUS.PENDING,

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
// GET DASHBOARD DATA
// ======================================================

const getDashboard = async (userId) => {

    // --------------------------------------------------
    // GET MODULE DATA
    // --------------------------------------------------

    const [
        totalVehicles,
        rcSummary,
        insuranceRecords,
        puc
    ] = await Promise.all([

        dashboardModel.getTotalVehicles(
            userId
        ),

        dashboardModel.getRcSummary(
            userId
        ),

        dashboardModel.getVehicleInsuranceData(
            userId
        ),

        dashboardModel.getPucSummary(
            userId
        )
    ]);

    // --------------------------------------------------
    // GROUP INSURANCE POLICIES BY VEHICLE
    // --------------------------------------------------

    const vehicles =
        groupPoliciesByVehicle(
            insuranceRecords
        );

    // --------------------------------------------------
    // INSURANCE SUMMARY
    // --------------------------------------------------

    const insuranceSummary = {

        valid: 0,

        expiringSoon: 0,

        expired: 0,

        pending: 0
    };

    // --------------------------------------------------
    // CALCULATE INSURANCE HEALTH
    // --------------------------------------------------

    for (
        const records of vehicles.values()
    ) {

        const health =
            evaluateInsuranceHealth(
                records
            );

        if (
            insuranceSummary[
                health.status
            ] !== undefined
        ) {

            insuranceSummary[
                health.status
            ]++;
        }
    }

    // --------------------------------------------------
    // FINAL RESPONSE
    // --------------------------------------------------

    return {

        // ----------------------------------------------
        // VEHICLES
        // ----------------------------------------------

        totalVehicles: Number(
            totalVehicles.totalVehicles
        ),

        vehicles: {

            rcReceived: Number(
                rcSummary.rcReceived || 0
            ),

            rcPending: Number(
                rcSummary.rcPending || 0
            )
        },

        // ----------------------------------------------
        // INSURANCE
        // ----------------------------------------------

        insurance: {

            valid:
                insuranceSummary.valid,

            expiringSoon:
                insuranceSummary.expiringSoon,

            expired:
                insuranceSummary.expired,

            pending:
                insuranceSummary.pending
        },

        // ----------------------------------------------
        // PUC
        // ----------------------------------------------

        puc: {

            expired: Number(
                puc.expired
            ),

            expiringSoon: Number(
                puc.expiringSoon
            ),

            valid: Number(
                puc.valid
            ),

            noPuc: Number(
                puc.noPuc
            )
        }
    };
};

// ======================================================
// MODULE EXPORTS
// ======================================================

module.exports = {
    getDashboard
};