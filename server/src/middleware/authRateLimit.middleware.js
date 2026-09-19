const crypto = require("crypto");

const buckets = new Map();
let lastCleanupAt = 0;

const GENERIC_RATE_LIMIT_MESSAGE =
    "Too many requests. Please try again later.";

const hashIdentifier = (value) => crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");

const normalizeEmail = (value) => String(value || "")
    .trim()
    .toLowerCase();

const normalizePhone = (value) => String(value || "")
    .replace(/\D/g, "");

const normalizeUserId = (value) => String(value || "").trim();

const cleanupExpiredBuckets = (now) => {
    if (now - lastCleanupAt < 60 * 1000) {
        return;
    }

    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }

    lastCleanupAt = now;
};

const getBucket = (key, now, windowMs) => {
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        return {
            count: 0,
            resetAt: now + windowMs
        };
    }

    return bucket;
};

const createAuthRateLimit = ({
    name,
    windowMs,
    maxPerIp,
    maxPerIdentifier,
    getIdentifiers = () => []
}) => (req, res, next) => {
    const now = Date.now();
    cleanupExpiredBuckets(now);

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const keys = [
        {
            key: `${name}:ip:${hashIdentifier(ip)}`,
            limit: maxPerIp
        }
    ];

    const identifiers = getIdentifiers(req)
        .filter(Boolean)
        .map((identifier) => hashIdentifier(identifier));

    for (const identifier of new Set(identifiers)) {
        keys.push({
            key: `${name}:identifier:${identifier}`,
            limit: maxPerIdentifier
        });
    }

    const bucketEntries = keys.map(({ key, limit }) => ({
        key,
        limit,
        bucket: getBucket(key, now, windowMs)
    }));

    const blockedBucket = bucketEntries.find(
        ({ bucket, limit }) => bucket.count >= limit
    );

    if (blockedBucket) {
        const retryAfterSeconds = Math.max(
            1,
            Math.ceil((blockedBucket.bucket.resetAt - now) / 1000)
        );

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
            success: false,
            message: GENERIC_RATE_LIMIT_MESSAGE
        });
    }

    for (const { key, bucket } of bucketEntries) {
        buckets.set(key, {
            ...bucket,
            count: bucket.count + 1
        });
    }

    return next();
};

const loginRateLimit = createAuthRateLimit({
    name: "login",
    windowMs: 15 * 60 * 1000,
    maxPerIp: 20,
    maxPerIdentifier: 8,
    getIdentifiers: (req) => [normalizeEmail((req.body || {}).email)]
});

const registrationRateLimit = createAuthRateLimit({
    name: "registration",
    windowMs: 60 * 60 * 1000,
    maxPerIp: 10,
    maxPerIdentifier: 3,
    getIdentifiers: (req) => [
        normalizeEmail((req.body || {}).email),
        normalizePhone((req.body || {}).phone)
    ]
});

const emailOtpVerificationRateLimit = createAuthRateLimit({
    name: "email-otp-verification",
    windowMs: 10 * 60 * 1000,
    maxPerIp: 30,
    maxPerIdentifier: 8,
    getIdentifiers: (req) => [normalizeEmail((req.body || {}).email)]
});

const phoneOtpSendRateLimit = createAuthRateLimit({
    name: "phone-otp-send",
    windowMs: 15 * 60 * 1000,
    maxPerIp: 10,
    maxPerIdentifier: 3,
    getIdentifiers: (req) => [
        normalizeUserId((req.body || {}).userId),
        normalizePhone((req.body || {}).phone)
    ]
});

const phoneOtpVerificationRateLimit = createAuthRateLimit({
    name: "phone-otp-verification",
    windowMs: 10 * 60 * 1000,
    maxPerIp: 30,
    maxPerIdentifier: 8,
    getIdentifiers: (req) => [normalizePhone((req.body || {}).phone)]
});

module.exports = {
    loginRateLimit,
    registrationRateLimit,
    emailOtpVerificationRateLimit,
    phoneOtpSendRateLimit,
    phoneOtpVerificationRateLimit
};
