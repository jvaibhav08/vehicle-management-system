const fs = require("fs");
const path = require("path");

const insuranceModel = require("../models/insurance.model");
const vehicleModel = require("../models/vehicle.model");
const AppError = require("../utils/AppError");

const {
    UPLOAD_ROOT
} = require("../middleware/insuranceDocument.middleware");

const getPolicyDocumentName = (policyPath) => {
    if (!policyPath) {
        return null;
    }

    const fileName = path.basename(policyPath);
    const separatorIndex = fileName.indexOf("--");

    return separatorIndex >= 0
        ? fileName.slice(separatorIndex + 2)
        : fileName;
};

const withPolicyDocumentMetadata = (insurance) => ({
    ...insurance,
    policy_name: getPolicyDocumentName(insurance.policy_path)
});

const resolvePolicyDocumentPath = (policyPath) => {
    const absolutePath = path.resolve(UPLOAD_ROOT, "..", policyPath);
    const uploadBase = path.resolve(UPLOAD_ROOT, "..");

    if (!absolutePath.startsWith(`${uploadBase}${path.sep}`)) {
        throw new AppError("Insurance policy document not found", 404);
    }

    return absolutePath;
};

const verifyStoredPolicyDocument = async (policyPath) => {
    if (!policyPath) {
        return;
    }

    try {
        await fs.promises.access(
            resolvePolicyDocumentPath(policyPath),
            fs.constants.R_OK
        );
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError("Insurance policy document could not be stored", 500);
    }
};

const removePolicyDocument = async (policyPath) => {
    if (!policyPath) {
        return;
    }

    try {
        await fs.promises.unlink(resolvePolicyDocumentPath(policyPath));
    } catch (error) {
        // The database reference has already been removed/replaced. A missing
        // physical file is safe to ignore.
    }
};

// ======================================================
// HELPER 1: GET LATER POLICY
// ======================================================

const getLaterPolicy = (policyA, policyB) => {

    if (!policyA) {
        return policyB;
    }

    if (!policyB) {
        return policyA;
    }

    const expiryA = new Date(policyA.expiry_date);
    const expiryB = new Date(policyB.expiry_date);

    return expiryA >= expiryB
        ? policyA
        : policyB;
};


// ======================================================
// HELPER 2: GET LATEST POLICY OF A SPECIFIC TYPE
// ======================================================

const getLatestPolicyByType = (
    policies,
    insuranceType
) => {

    const matchingPolicies = policies.filter(
        (policy) => policy.insurance_type === insuranceType
    );

    if (matchingPolicies.length === 0) {
        return undefined;
    }

    return matchingPolicies.reduce((latest, current) => {

        const latestExpiry = new Date(latest.expiry_date);
        const currentExpiry = new Date(current.expiry_date);

        return currentExpiry > latestExpiry
            ? current
            : latest;
    });
};


// ======================================================
// HELPER 3: REFRESH ACTIVE / PREVIOUS STATUSES
// ======================================================

const refreshInsuranceStatuses = async (vehicleId) => {

    // Fetch all currently active policies
    const activePolicies =
        await insuranceModel.getActiveInsuranceByVehicleId(
            vehicleId
        );


    // --------------------------------------------------
    // Find latest active policy of each insurance type
    // --------------------------------------------------

    const activeOwnDamage = getLatestPolicyByType(
        activePolicies,
        "own_damage"
    );

    const activeThirdParty = getLatestPolicyByType(
        activePolicies,
        "third_party"
    );

    const activeComprehensive = getLatestPolicyByType(
        activePolicies,
        "comprehensive"
    );


    // --------------------------------------------------
    // Determine effective coverage
    // --------------------------------------------------

    // Own Damage can come from:
    // standalone OD OR Comprehensive
    const effectiveOwnDamage = getLaterPolicy(
        activeOwnDamage,
        activeComprehensive
    );

    // Third Party can come from:
    // standalone TP OR Comprehensive
    const effectiveThirdParty = getLaterPolicy(
        activeThirdParty,
        activeComprehensive
    );


    // --------------------------------------------------
    // Store IDs of policies that are still useful
    // --------------------------------------------------

    const usefulPolicyIds = new Set();

    if (effectiveOwnDamage) {
        usefulPolicyIds.add(effectiveOwnDamage.id);
    }

    if (effectiveThirdParty) {
        usefulPolicyIds.add(effectiveThirdParty.id);
    }


    // --------------------------------------------------
    // Move redundant active policies to previous
    // --------------------------------------------------

    for (const policy of activePolicies) {

        if (!usefulPolicyIds.has(policy.id)) {

            // Keep maximum one previous row per type
            await insuranceModel.deletePreviousInsurance(
                vehicleId,
                policy.insurance_type
            );

            // Current redundant policy becomes previous
            await insuranceModel.updateInsuranceStatus(
                policy.id,
                "previous"
            );
        }
    }
};

// ======================================================
// HELPER 4. RECALCULATE INSURANCE STATUSES AFTER CORRECTION
// ======================================================

const recalculateInsuranceStatuses = async (vehicleId) => {

    // Fetch active + previous policies
    const policies =
        await insuranceModel.getInsuranceByVehicleId(
            vehicleId
        );

    // Separate policies by coverage type
    const ownDamagePolicies = policies.filter(
        (policy) => policy.insurance_type === "own_damage"
    );

    const thirdPartyPolicies = policies.filter(
        (policy) => policy.insurance_type === "third_party"
    );

    const comprehensivePolicies = policies.filter(
        (policy) => policy.insurance_type === "comprehensive"
    );


    // --------------------------------------------------
    // Find best Own Damage coverage
    // --------------------------------------------------

    const ownDamageCandidates = [
        ...ownDamagePolicies,
        ...comprehensivePolicies
    ];

    const bestOwnDamage = ownDamageCandidates.reduce(
        (bestPolicy, currentPolicy) => {

            if (!bestPolicy) {
                return currentPolicy;
            }

            const bestExpiry = new Date(
                bestPolicy.expiry_date
            );

            const currentExpiry = new Date(
                currentPolicy.expiry_date
            );

            return currentExpiry > bestExpiry
                ? currentPolicy
                : bestPolicy;
        },
        null
    );


    // --------------------------------------------------
    // Find best Third Party coverage
    // --------------------------------------------------

    const thirdPartyCandidates = [
        ...thirdPartyPolicies,
        ...comprehensivePolicies
    ];

    const bestThirdParty = thirdPartyCandidates.reduce(
        (bestPolicy, currentPolicy) => {

            if (!bestPolicy) {
                return currentPolicy;
            }

            const bestExpiry = new Date(
                bestPolicy.expiry_date
            );

            const currentExpiry = new Date(
                currentPolicy.expiry_date
            );

            return currentExpiry > bestExpiry
                ? currentPolicy
                : bestPolicy;
        },
        null
    );
    // --------------------------------------------------
    // Store IDs of policies that should remain active
    // --------------------------------------------------

    const activePolicyIds = new Set();

    if (bestOwnDamage) {
        activePolicyIds.add(bestOwnDamage.id);
    }

    if (bestThirdParty) {
        activePolicyIds.add(bestThirdParty.id);
    }

    // --------------------------------------------------
    // Synchronize policy statuses
    // --------------------------------------------------

    for (const policy of policies) {

        const shouldBeActive =
            activePolicyIds.has(policy.id);

        const desiredStatus =
            shouldBeActive ? "active" : "previous";

        // Update only if status actually needs to change
        if (policy.status !== desiredStatus) {

            await insuranceModel.updateInsuranceStatus(
                policy.id,
                desiredStatus
            );
        }
    }

    // --------------------------------------------------
    // Clean old previous insurance history
    // Keep only the latest previous policy per type
    // --------------------------------------------------

    const insuranceTypes = [
        "own_damage",
        "third_party",
        "comprehensive"
    ];

    for (const insuranceType of insuranceTypes) {

        // Fetch fresh data because statuses may have changed above
        const updatedPolicies =
            await insuranceModel.getInsuranceByVehicleId(
                vehicleId
            );

        const previousPolicies = updatedPolicies.filter(
            (policy) =>
                policy.insurance_type === insuranceType &&
                policy.status === "previous"
        );

        // Already 0 or 1 previous policy → nothing to clean
        if (previousPolicies.length <= 1) {
            continue;
        }

        // Sort by expiry date: latest first
        previousPolicies.sort(
            (policyA, policyB) =>
                new Date(policyB.expiry_date) -
                new Date(policyA.expiry_date)
        );

        // Keep the latest previous policy
        const policiesToDelete =
            previousPolicies.slice(1);

        // Delete older previous policies
        for (const policy of policiesToDelete) {

            await insuranceModel.deleteInsuranceById(
                policy.id
            );
        }
    }
};

// ======================================================
// ADD INSURANCE
// ======================================================

const addInsurance = async (
    insuranceData,
    userId,
    policyPath
) => {
    await verifyStoredPolicyDocument(policyPath);

    const createInsurance = async () => insuranceModel.addInsurance(newInsurance);

        // --------------------------------------------------
        // 1. Extract insurance data from request
        // --------------------------------------------------

        const {
            vehicle_id,
            insurance_company,
            policy_number,
            expiry_date,
            covers_own_damage,
            covers_third_party
        } = insuranceData;


        // --------------------------------------------------
        // 2. Validate required fields
        // --------------------------------------------------

        if (
            !vehicle_id ||
            !insurance_company ||
            !policy_number ||
            !expiry_date
        ) {
            throw new AppError(
                "Vehicle ID, insurance company, policy number and expiry date are required",
                400
            );
        }


        // --------------------------------------------------
        // 3. Validate coverage selections
        // --------------------------------------------------

        if (
            typeof covers_own_damage !== "boolean" ||
            typeof covers_third_party !== "boolean"
        ) {
            throw new AppError(
                "Insurance coverage selection is required",
                400
            );
        }

        if (!covers_own_damage && !covers_third_party) {
            throw new AppError(
                "At least one insurance coverage must be selected",
                400
            );
        }


        // --------------------------------------------------
        // 4. Derive insurance type
        // --------------------------------------------------

        let insuranceType;

        if (covers_own_damage && covers_third_party) {
            insuranceType = "comprehensive";
        }

        if (covers_own_damage && !covers_third_party) {
            insuranceType = "own_damage";
        }

        if (!covers_own_damage && covers_third_party) {
            insuranceType = "third_party";
        }


        // --------------------------------------------------
        // 5. Verify vehicle ownership
        // --------------------------------------------------

        const vehicle = await vehicleModel.getVehicle(
            vehicle_id,
            userId
        );

        if (!vehicle) {
            throw new AppError(
                "Vehicle not found",
                404
            );
        }


        // --------------------------------------------------
        // 6. Validate expiry date
        // --------------------------------------------------

        const expiryDate = new Date(expiry_date);

        if (isNaN(expiryDate.getTime())) {
            throw new AppError(
                "Invalid insurance expiry date",
                400
            );
        }

        const now = new Date();

        const today = new Date(Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        ));

        if (expiryDate < today) {
            throw new AppError(
                "Insurance policy has already expired",
                400
            );
        }


        // --------------------------------------------------
        // 7. Fetch existing active policies
        // --------------------------------------------------

        const activePolicies =
            await insuranceModel.getActiveInsuranceByVehicleId(
                vehicle_id
            );


        // --------------------------------------------------
        // 8. Find latest active policies by type
        // --------------------------------------------------

        const activeOwnDamage = getLatestPolicyByType(
            activePolicies,
            "own_damage"
        );

        const activeThirdParty = getLatestPolicyByType(
            activePolicies,
            "third_party"
        );

        const activeComprehensive = getLatestPolicyByType(
            activePolicies,
            "comprehensive"
        );


        // --------------------------------------------------
        // 9. Determine current effective coverage
        // --------------------------------------------------

        const effectiveOwnDamage = getLaterPolicy(
            activeOwnDamage,
            activeComprehensive
        );

        const effectiveThirdParty = getLaterPolicy(
            activeThirdParty,
            activeComprehensive
        );


        // --------------------------------------------------
        // 10. Prepare DB-ready insurance object
        // --------------------------------------------------

        const newInsurance = {
            vehicle_id,
            insurance_type: insuranceType,
            insurance_company,
            policy_number,
            expiry_date,
            status: "active",
            policy_path: policyPath || null
        };


        // --------------------------------------------------
        // 11. First insurance entry for vehicle
        // --------------------------------------------------

        if (activePolicies.length === 0) {

            const result = await createInsurance();

            return {
                action: "created",
                result
            };
        }


        // ==================================================
        // 12. HANDLE OWN DAMAGE
        // ==================================================

        if (insuranceType === "own_damage") {

            if (!effectiveOwnDamage) {

                const result = await createInsurance();

                await refreshInsuranceStatuses(vehicle_id);

                return {
                    action: "created",
                    result
                };
            }


            const existingExpiryDate = new Date(
                effectiveOwnDamage.expiry_date
            );

            const existingExpiryUTC = new Date(Date.UTC(
                existingExpiryDate.getFullYear(),
                existingExpiryDate.getMonth(),
                existingExpiryDate.getDate()
            ));


            if (expiryDate <= existingExpiryUTC) {
                throw new AppError(
                    "New Own Damage expiry date must be later than the existing coverage",
                    409
                );
            }


            const result = await createInsurance();

            await refreshInsuranceStatuses(
                vehicle_id
            );

            return {
                action: "renewed",
                result
            };
        }


        // ==================================================
        // 13. HANDLE THIRD PARTY
        // ==================================================

        if (insuranceType === "third_party") {

            if (!effectiveThirdParty) {

                const result = await createInsurance();

                await refreshInsuranceStatuses(vehicle_id);

                return {
                    action: "created",
                    result
                };
            }


            const existingExpiryDate = new Date(
                effectiveThirdParty.expiry_date
            );

            const existingExpiryUTC = new Date(Date.UTC(
                existingExpiryDate.getFullYear(),
                existingExpiryDate.getMonth(),
                existingExpiryDate.getDate()
            ));


            if (expiryDate <= existingExpiryUTC) {
                throw new AppError(
                    "New Third Party expiry date must be later than the existing coverage",
                    409
                );
            }


            const result = await createInsurance();

            await refreshInsuranceStatuses(
                vehicle_id
            );

            return {
                action: "renewed",
                result
            };
        }


        // ==================================================
        // 14. HANDLE COMPREHENSIVE
        // ==================================================

        if (insuranceType === "comprehensive") {

            let improvesOwnDamage = false;
            let improvesThirdParty = false;


            if (!effectiveOwnDamage) {

                improvesOwnDamage = true;

            } else {

                const existingOwnDamageExpiry = new Date(
                    effectiveOwnDamage.expiry_date
                );

                const existingOwnDamageExpiryUTC = new Date(Date.UTC(
                    existingOwnDamageExpiry.getFullYear(),
                    existingOwnDamageExpiry.getMonth(),
                    existingOwnDamageExpiry.getDate()
                ));

                if (expiryDate > existingOwnDamageExpiryUTC) {
                    improvesOwnDamage = true;
                }
            }


            if (!effectiveThirdParty) {

                improvesThirdParty = true;

            } else {

                const existingThirdPartyExpiry = new Date(
                    effectiveThirdParty.expiry_date
                );

                const existingThirdPartyExpiryUTC = new Date(Date.UTC(
                    existingThirdPartyExpiry.getFullYear(),
                    existingThirdPartyExpiry.getMonth(),
                    existingThirdPartyExpiry.getDate()
                ));

                if (expiryDate > existingThirdPartyExpiryUTC) {
                    improvesThirdParty = true;
                }
            }


            if (!improvesOwnDamage && !improvesThirdParty) {
                throw new AppError(
                    "Comprehensive policy does not improve existing insurance coverage",
                    409
                );
            }


            const result = await createInsurance();

            await refreshInsuranceStatuses(
                vehicle_id
            );

            return {
                action: "created",
                result
            };
        }

};
// ======================================================
// GET INSURANCE BY VEHICLE
// ======================================================

const getInsuranceByVehicleId = async (vehicleId, userId) => {

    // --------------------------------------------------
    // 1. Verify vehicle ownership
    // --------------------------------------------------

    const vehicle = await vehicleModel.getVehicle(
        vehicleId,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found",
            404
        );
    }


    // --------------------------------------------------
    // 2. Fetch all insurance policies of the vehicle
    // --------------------------------------------------

    const policies =
        await insuranceModel.getInsuranceByVehicleId(
            vehicleId
        );


    // --------------------------------------------------
    // 3. Separate active and previous policies
    // --------------------------------------------------

    const activePolicies = policies.filter(
        (policy) => policy.status === "active"
    );

    const previousPolicies = policies.filter(
        (policy) => policy.status === "previous"
    );


    // --------------------------------------------------
    // 4. Return structured insurance data
    // --------------------------------------------------

    return {
        active: activePolicies.map(withPolicyDocumentMetadata),
        previous: previousPolicies.map(withPolicyDocumentMetadata)
    };
};

// ======================================================
// GET SINGLE INSURANCE POLICY
// ======================================================

const getInsuranceById = async (
    insuranceId,
    userId
) => {

    // --------------------------------------------------
    // 1. Find insurance policy
    // --------------------------------------------------

    const insurance =
        await insuranceModel.getInsuranceById(
            insuranceId
        );

    if (!insurance) {
        throw new AppError(
            "Insurance policy not found",
            404
        );
    }


    // --------------------------------------------------
    // 2. Verify vehicle ownership
    // --------------------------------------------------

    const vehicle = await vehicleModel.getVehicle(
        insurance.vehicle_id,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "Insurance policy not found",
            404
        );
    }


    // --------------------------------------------------
    // 3. Return insurance policy
    // --------------------------------------------------

    return withPolicyDocumentMetadata(insurance);
};


// ======================================================
// UPDATE INSURANCE
// Used for correcting an incorrectly entered ACTIVE policy
// ======================================================

const updateInsurance = async (
    insuranceId,
    insuranceData,
    userId
) => {

    // --------------------------------------------------
    // 1. Find insurance policy
    // --------------------------------------------------

    const insurance =
        await insuranceModel.getInsuranceById(
            insuranceId
        );

    if (!insurance) {
        throw new AppError(
            "Insurance policy not found",
            404
        );
    }


    // --------------------------------------------------
    // 2. Verify vehicle ownership
    // --------------------------------------------------

    const vehicle = await vehicleModel.getVehicle(
        insurance.vehicle_id,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "Insurance policy not found",
            404
        );
    }


    // --------------------------------------------------
    // 3. Only active insurance can be corrected
    // --------------------------------------------------

    if (insurance.status !== "active") {
        throw new AppError(
            "Previous insurance policies cannot be edited",
            409
        );
    }


    // --------------------------------------------------
    // 4. Extract editable fields
    // --------------------------------------------------

    const {
        insurance_company,
        policy_number,
        expiry_date,
        covers_own_damage,
        covers_third_party
    } = insuranceData;


    // --------------------------------------------------
    // 5. Validate required fields
    // --------------------------------------------------

    if (
        !insurance_company ||
        !policy_number ||
        !expiry_date
    ) {
        throw new AppError(
            "Insurance company, policy number and expiry date are required",
            400
        );
    }


    // --------------------------------------------------
    // 6. Validate coverage selections
    // --------------------------------------------------

    if (
        typeof covers_own_damage !== "boolean" ||
        typeof covers_third_party !== "boolean"
    ) {
        throw new AppError(
            "Insurance coverage selection is required",
            400
        );
    }

    if (!covers_own_damage && !covers_third_party) {
        throw new AppError(
            "At least one insurance coverage must be selected",
            400
        );
    }


    // --------------------------------------------------
    // 7. Derive corrected insurance type
    // --------------------------------------------------

    let insuranceType;

    if (covers_own_damage && covers_third_party) {
        insuranceType = "comprehensive";
    }

    if (covers_own_damage && !covers_third_party) {
        insuranceType = "own_damage";
    }

    if (!covers_own_damage && covers_third_party) {
        insuranceType = "third_party";
    }


    // --------------------------------------------------
    // 8. Validate expiry date
    // --------------------------------------------------

    const expiryDate = new Date(expiry_date);

    if (isNaN(expiryDate.getTime())) {
        throw new AppError(
            "Invalid insurance expiry date",
            400
        );
    }

    const now = new Date();

    const today = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ));

    if (expiryDate < today) {
        throw new AppError(
            "Insurance policy has already expired",
            400
        );
    }


    // --------------------------------------------------
    // 9. Prepare safe corrected insurance data
    // --------------------------------------------------

    const updatedInsurance = {
        insurance_type: insuranceType,
        insurance_company,
        policy_number,
        expiry_date
    };


    // --------------------------------------------------
    // 10. Update insurance policy
    // --------------------------------------------------

    const result = await insuranceModel.updateInsurance(
        insuranceId,
        updatedInsurance
    );


    // --------------------------------------------------
    // 11. Recalculate complete coverage state
    //
    // This is important because correcting:
    // - insurance type
    // - expiry date
    //
    // can change which OD / TP policies should be active.
    // --------------------------------------------------

    await recalculateInsuranceStatuses(
        insurance.vehicle_id
    );


    // --------------------------------------------------
    // 12. Return result
    // --------------------------------------------------

    return {
        action: "updated",
        result
    };
};
// ======================================================
// GET ALL ACTIVE INSURANCE POLICIES
// ======================================================

const getAllActiveInsurance = async (userId) => {

    const policies =
        await insuranceModel.getAllActiveInsurance(
            userId
        );

    return policies.map(withPolicyDocumentMetadata);
};

const getInsurancePolicyDocument = async (
    insuranceId,
    userId
) => {

    // --------------------------------------------------
    // 1. Find insurance policy
    // --------------------------------------------------

    const insurance = await insuranceModel.getInsuranceById(
        insuranceId
    );

    if (!insurance) {
        throw new AppError(
            "Insurance policy not found",
            404
        );
    }


    // --------------------------------------------------
    // 2. Verify vehicle ownership
    // --------------------------------------------------

    const vehicle = await vehicleModel.getVehicle(
        insurance.vehicle_id,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "Insurance policy not found",
            404
        );
    }


    // --------------------------------------------------
    // 3. Check policy document
    // --------------------------------------------------

    const policyPath = insurance.policy_path;

    if (!policyPath) {
        throw new AppError(
            "Insurance policy document not found",
            404
        );
    }


    // --------------------------------------------------
    // 4. Resolve private file path safely
    // --------------------------------------------------

    const absolutePath = resolvePolicyDocumentPath(policyPath);


    // --------------------------------------------------
    // 6. Verify physical file exists
    // --------------------------------------------------

    try {
        await fs.promises.access(
            absolutePath,
            fs.constants.R_OK
        );
    } catch (error) {
        throw new AppError(
            "Insurance policy document not found",
            404
        );
    }


    // --------------------------------------------------
    // 7. Return file information
    // --------------------------------------------------

    return {
        absolutePath,
        downloadName: `Insurance-policy${path.extname(policyPath)}`
    };
};

const replaceInsurancePolicyDocument = async (
    insuranceId,
    userId,
    policyPath
) => {
    if (!policyPath) {
        throw new AppError("Insurance policy document is required", 400);
    }

    await verifyStoredPolicyDocument(policyPath);

    const insurance = await getInsuranceById(insuranceId, userId);
    const result = await insuranceModel.updateInsurancePolicyPath(
        insuranceId,
        policyPath
    );

    if (result.affectedRows === 0) {
        throw new AppError("Failed to save insurance policy document", 500);
    }

    const savedInsurance = await insuranceModel.getInsuranceById(insuranceId);

    if (!savedInsurance || savedInsurance.policy_path !== policyPath) {
        throw new AppError("Failed to save insurance policy document", 500);
    }

    await removePolicyDocument(insurance.policy_path);

    return withPolicyDocumentMetadata(savedInsurance);
};

const deleteInsurancePolicyDocument = async (insuranceId, userId) => {
    const insurance = await getInsuranceById(insuranceId, userId);

    if (!insurance.policy_path) {
        throw new AppError("Insurance policy document not found", 404);
    }

    const result = await insuranceModel.updateInsurancePolicyPath(
        insuranceId,
        null
    );

    if (result.affectedRows === 0) {
        throw new AppError("Failed to delete insurance policy document", 500);
    }

    const savedInsurance = await insuranceModel.getInsuranceById(insuranceId);

    if (savedInsurance?.policy_path) {
        throw new AppError("Failed to delete insurance policy document", 500);
    }

    await removePolicyDocument(insurance.policy_path);
};

module.exports = {
    addInsurance,
    getInsuranceByVehicleId,
    getInsuranceById,
    updateInsurance,
    getAllActiveInsurance,
    getInsurancePolicyDocument,
    replaceInsurancePolicyDocument,
    deleteInsurancePolicyDocument
};
