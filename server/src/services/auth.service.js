const authModel = require("../models/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const otpService = require("./otp.service");


// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (userData) => {

    try {

        // --------------------------------------------------
        // 1. User must provide at least email OR phone
        // --------------------------------------------------

        if (!userData.email && !userData.phone) {

            return {
                success: false,
                message: "Email or phone number is required"
            };
        }


        // --------------------------------------------------
        // 2. Check if email is already registered
        // --------------------------------------------------

        if (userData.email) {

            const existingEmail = await authModel.findByEmail(
                userData.email
            );

            if (existingEmail.length > 0) {

                return {
                    success: false,
                    message: "Email already registered"
                };
            }
        }


        // --------------------------------------------------
        // 3. Check if phone number is already registered
        // --------------------------------------------------

        if (userData.phone) {

            const existingPhone = await authModel.findByPhone(
                userData.phone
            );

            if (existingPhone.length > 0) {

                return {
                    success: false,
                    message: "Phone number already registered"
                };
            }
        }


        // --------------------------------------------------
        // 4. Hash the user's password
        // --------------------------------------------------

        const hashedPassword = await bcrypt.hash(
            userData.password,
            10
        );


        // --------------------------------------------------
        // 5. Prepare user data for database
        //
        // Email and phone are optional.
        // If one is not provided, store NULL.
        // --------------------------------------------------

        const newUserData = {

            name: userData.name,

            email: userData.email || null,

            phone: userData.phone || null,

            password: hashedPassword
        };


        // --------------------------------------------------
        // 6. Create the user
        // --------------------------------------------------

        const result = await authModel.createUser(
            newUserData
        );


        if (result.affectedRows === 0) {

            return {
                success: false,
                message: "User registration failed"
            };
        }


        // --------------------------------------------------
        // 7. Create user object
        //
        // We use the newly generated database ID
        // for OTP verification.
        // --------------------------------------------------

        const user = {

            id: result.insertId,

            name: userData.name,

            email: userData.email || null,

            phone: userData.phone || null
        };


        // ==================================================
        // 8. EMAIL VERIFICATION
        // ==================================================

        // If the user registered with an email,
        // send an email verification OTP.

        if (user.email) {

            const otpResult =
                await otpService.createEmailVerificationOtp(
                    user
                );


            if (!otpResult.success) {

                return {
                    success: false,
                    message:
                        "User registered, but verification email could not be sent"
                };
            }


            return {
                success: true,
                message:
                    "Registration successful. Please verify your email."
            };
        }


        // ==================================================
        // 9. PHONE VERIFICATION
        // ==================================================

        // Phone OTP functionality will be added here.
        //
        // For now, if the user registered using only
        // their phone number, we return this response.
        //
        // Later this section will call something like:
        //
        // otpService.createPhoneVerificationOtp(user)
        //
        // and send the OTP through an SMS provider.

        if (user.phone) {

            return {
                success: true,
                message:
                    "Registration successful. Please verify your phone."
            };
        }


    } catch (error) {

        // --------------------------------------------------
        // Handle unexpected registration errors
        // --------------------------------------------------

        console.log("Registration error:", error);

        return {
            success: false,
            message: "Database error"
        };
    }
};


// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (loginData) => {

    try {

        // --------------------------------------------------
        // Find user by email
        //
        // For now login still uses email.
        // We will modify this later to support:
        //
        // email OR phone
        // --------------------------------------------------

        const existingUser = await authModel.findByEmail(
            loginData.email
        );


        if (existingUser.length === 0) {

            return {
                success: false,
                message: "Invalid email or password"
            };
        }


        // --------------------------------------------------
        // Get the user record
        // --------------------------------------------------

        const user = existingUser[0];


        // --------------------------------------------------
        // Compare entered password with hashed password
        // --------------------------------------------------

        const isPasswordMatch = await bcrypt.compare(
            loginData.password,
            user.password
        );


        if (!isPasswordMatch) {

            return {
                success: false,
                message: "Invalid email or password"
            };
        }


        // --------------------------------------------------
        // Check email verification
        //
        // IMPORTANT:
        // This will be changed later because our new
        // system allows phone-only registration.
        //
        // For now we keep your existing email check.
        // --------------------------------------------------

        if (!user.email_verified) {

            return {
                success: false,
                message:
                    "Please verify your email before logging in"
            };
        }


        // --------------------------------------------------
        // A trusted-device JWT can skip a new OTP only for
        // this same user and only until its one-day expiry.
        // Password validation above is still always required.
        // --------------------------------------------------

        if (loginData.trustedDeviceToken) {

            try {

                const trustedDevice = jwt.verify(
                    loginData.trustedDeviceToken,
                    process.env.JWT_SECRET
                );

                if (
                    trustedDevice.type === "trusted_device" &&
                    trustedDevice.id === user.id &&
                    trustedDevice.email === user.email
                ) {
                    return {
                        success: true,
                        message: "Login successful",
                        token: loginData.trustedDeviceToken,
                        trustedDeviceToken: loginData.trustedDeviceToken,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            role: user.role
                        }
                    };
                }

            } catch (error) {
                // Expired or invalid device tokens fall through
                // to the normal OTP flow.
            }
        }


        // --------------------------------------------------
        // Send a login OTP. A JWT is issued only after the
        // OTP has been successfully verified.
        // --------------------------------------------------

        const otpResult = await otpService.createLoginOtp(
            user
        );

        if (!otpResult.success) {
            return otpResult;
        }

        return {
            success: true,
            message: "Login OTP sent. Please verify your email.",
            requiresOtp: true
        };


    } catch (error) {

        // --------------------------------------------------
        // Handle unexpected login errors
        // --------------------------------------------------

        console.log("Login error:", error);

        return {
            success: false,
            message: "Database error"
        };
    }
};


// ======================================================
// EXPORT SERVICES
// ======================================================

module.exports = {
    registerUser,
    loginUser
};
