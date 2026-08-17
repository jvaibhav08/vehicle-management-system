const { STATE_CODES } = require("./vehicleConstants");

const validateVehicleNumber = (plate) => {
    if (!plate || typeof plate !== "string") {
        return {
            valid: false,
            message: "Vehicle number is required",
        };
    }

    const value = plate.trim().toUpperCase();

    // Standard Indian vehicle number:
    // SS RR [AAA] NNNN
    const match = value.match(
        /^([A-Z]{2})([0-9]{2})([A-Z]{0,3})([0-9]{4})$/
    );

    if (!match) {
        return {
            valid: false,
            message:
                "Invalid vehicle number format. Example: PB10AB1234",
        };
    }

    const [, stateCode, districtCode, series, uniqueNumber] = match;

    // Validate state / UT code
    if (!STATE_CODES[stateCode]) {
        return {
            valid: false,
            message: `Invalid state registration code: ${stateCode}`,
        };
    }

    // District code is already guaranteed to be 2 digits
    // by the regex, but we keep this check explicit.
    if (!/^\d{2}$/.test(districtCode)) {
        return {
            valid: false,
            message: "Invalid RTO district code",
        };
    }

    // 0000 is not a valid vehicle number
    if (uniqueNumber === "0000") {
        return {
            valid: false,
            message: "Vehicle number cannot end with 0000",
        };
    }

    return {
        valid: true,
        stateCode,
        state: STATE_CODES[stateCode],
        districtCode,
        series,
        uniqueNumber,
    };
};

module.exports = {
    validateVehicleNumber,
};