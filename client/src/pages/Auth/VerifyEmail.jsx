import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { verifyEmailOtp } from "../../services/auth.service";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";


function VerifyEmail() {

    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuth();

    const { showToast } = useToast();


    // --------------------------------------------------
    // Email passed from Signup page
    // --------------------------------------------------

    const email =
        location.state?.email || "";

    const purpose =
        location.state?.purpose || "email_verification";

    const rememberMe =
        location.state?.rememberMe || false;

    const [isSubmitting, setIsSubmitting] = useState(false);


    // --------------------------------------------------
    // React Hook Form
    // --------------------------------------------------

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();


    // ==================================================
    // VERIFY OTP
    // ==================================================

    const onSubmit = async (data) => {

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {

            // --------------------------------------------------
            // Send email + OTP to backend
            // --------------------------------------------------

            const response =
                await verifyEmailOtp({

                    email,

                    otp: data.otp,

                    purpose
                });


            // --------------------------------------------------
            // Verification failed
            // --------------------------------------------------

            if (!response.success) {

                showToast(
                    response.message || "Invalid OTP",
                    "error"
                );

                return;
            }


            // --------------------------------------------------
            // Email successfully verified
            // --------------------------------------------------

            showToast(
                response.message ||
                "Email verified successfully",
                "success"
            );


            // --------------------------------------------------
            // IMPORTANT
            //
            // Backend now returns:
            //
            // response.token
            // response.user
            //
            // Store them in AuthContext so the user
            // becomes authenticated immediately.
            // --------------------------------------------------

            login(
                response.user,
                response.token,
                {
                    rememberMe,
                    trustedDeviceToken: response.trustedDeviceToken,
                }
            );


            // --------------------------------------------------
            // Go directly to dashboard
            // --------------------------------------------------

            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                "Email verification error:",
                error
            );

            showToast(
                error.response?.data?.message ||
                "Something went wrong. Please try again.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700">


            {/* ==================================================
                BACKGROUND ANIMATION
            ================================================== */}

            <motion.div
                className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-white/10 blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />


            <motion.div
                className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-emerald-200/10 blur-3xl"
                animate={{
                    x: [0, -40, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.15, 1]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />


            {/* Dot grid */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-6
                    top-8
                    h-40
                    w-40
                    opacity-40
                    [background-image:radial-gradient(circle,white_1px,transparent_1px)]
                    [background-size:16px_16px]
                "
            />


            <div
                className="
                    pointer-events-none
                    absolute
                    -left-6
                    bottom-6
                    h-40
                    w-40
                    opacity-40
                    [background-image:radial-gradient(circle,white_1px,transparent_1px)]
                    [background-size:16px_16px]
                "
            />


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">


                <motion.div
                    initial={{
                        opacity: 0,
                        y: 40
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.7
                    }}
                    className="w-full max-w-lg"
                >


                    {/* ==================================================
                        CARD
                    ================================================== */}

                    <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">


                        {/* ==================================================
                            HEADER
                        ================================================== */}

                        <div className="text-center">


                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-emerald-500
                                    to-teal-600
                                    text-white
                                    shadow-lg
                                "
                            >
                                <ShieldCheck size={32} />
                            </div>


                            <h2 className="mt-6 text-3xl font-bold text-gray-800">
                                Verify Your Email
                            </h2>


                            <p className="mt-2 text-gray-500">
                                Enter the verification code we sent to your email.
                            </p>


                        </div>


                        {/* ==================================================
                            EMAIL DISPLAY
                        ================================================== */}

                        <div className="mt-6 rounded-2xl bg-emerald-50 p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">

                                    <Mail
                                        size={20}
                                        className="text-emerald-600"
                                    />

                                </div>


                                <div className="min-w-0">

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Verification email
                                    </p>

                                    <p className="truncate text-sm font-semibold text-gray-700">
                                        {email || "Your registered email"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            FORM
                        ================================================== */}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="mt-7 space-y-5"
                        >

                            <Input
                                label="Verification Code"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                {...register("otp", {

                                    required:
                                        "Verification code is required",

                                    pattern: {
                                        value: /^[0-9]{6}$/,

                                        message:
                                            "OTP must be 6 digits"
                                    }
                                })}
                                error={errors.otp?.message}
                            />


                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Verifying..." : "Verify Email"}
                            </Button>

                        </form>


                        {/* ==================================================
                            BACK TO LOGIN
                        ================================================== */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            disabled={isSubmitting}
                            className="
                                mx-auto
                                cursor-pointer
                                mt-6
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-emerald-700
                                transition-colors
                                hover:text-emerald-800
                            "
                        >

                            <ArrowLeft size={16} />

                            Back to Login

                        </button>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <p className="mt-7 text-center text-xs text-gray-400">

                            &copy; 2026 Vehicle Management System

                        </p>


                    </div>

                </motion.div>

            </div>

        </div>
    );
}


export default VerifyEmail;
