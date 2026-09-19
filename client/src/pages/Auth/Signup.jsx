import { motion } from "framer-motion";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { register as registerService } from "../../services/auth.service";

import { useToast } from "../../context/ToastContext";

import {
  User,
  Mail,
  Car,
  ShieldCheck,
  FileCheck,
  BadgeCheck,
  Zap,
  Shield,
  CheckCircle2,
} from "lucide-react";

import { useForm } from "react-hook-form";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

function Signup() {
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  // ======================================================
  // HANDLE SIGNUP
  // ======================================================

  const onSubmit = async (data) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerService({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // --------------------------------------------------
      // REGISTRATION FAILED
      // --------------------------------------------------

      if (!response.success) {
        showToast(
          response.message || "Registration failed",
          "error"
        );

        return;
      }

      // --------------------------------------------------
      // REGISTRATION SUCCESSFUL
      // --------------------------------------------------

      showToast(
        response.message ||
          "Account created successfully. Please verify your email.",
        "success"
      );

      // --------------------------------------------------
      // GO TO EMAIL VERIFICATION
      //
      // Pass the registered email to VerifyEmail.jsx
      // through React Router state.
      // --------------------------------------------------

      navigate("/verify-email", {
        state: {
          email: data.email,
          purpose: "email_verification",
        },
      });

    } catch (error) {
      console.error("Signup error:", error);

      showToast(
        error.response?.data?.message ||
          "Something went wrong while creating your account",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================================================
  // FEATURES
  // ======================================================

  const features = [
    {
      title: "Vehicle Records",
      icon: Car,
    },
    {
      title: "Insurance Tracking",
      icon: ShieldCheck,
    },
    {
      title: "PUC Management",
      icon: FileCheck,
    },
    {
      title: "RC Status",
      icon: BadgeCheck,
    },
  ];

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700">

      {/* ==================================================
          ANIMATED BACKGROUND
      ================================================== */}

      <motion.div
        className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-white/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-emerald-200/10 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ==================================================
          DOT GRID ACCENTS
      ================================================== */}

      <div className="pointer-events-none absolute -right-6 top-8 h-40 w-40 opacity-40 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="pointer-events-none absolute -left-6 bottom-6 h-40 w-40 opacity-40 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-between gap-16 px-8 py-8 lg:px-12">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden flex-1 lg:block"
        >

          <div className="max-w-xl">

            {/* Logo Icon */}

            <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md">
              <Car
                size={42}
                className="text-white"
              />
            </div>

            {/* Heading */}

            <h1 className="text-5xl font-bold leading-tight text-white">
              Vehicle
              <br />
              Management
              <br />
              System
            </h1>

            {/* Divider */}

            <div className="my-5 flex items-center gap-3">

              <span className="h-px max-w-[90px] flex-1 bg-white/30" />

              <ShieldCheck
                size={16}
                className="text-white/70"
              />

              <span className="h-px max-w-[90px] flex-1 bg-white/30" />

            </div>

            {/* Description */}

            <p className="max-w-md text-lg leading-8 text-emerald-100">
              Manage your vehicles, insurance, PUC and RC
              records from one secure dashboard.
            </p>

            {/* Features */}

            <div className="mt-8 flex justify-center">

              <div className="w-full max-w-md">

                {features.map((item, idx) => {

                  const Icon = item.icon;

                  const isLast =
                    idx === features.length - 1;

                  return (
                    <div
                      key={item.title}
                      className={`flex items-center justify-between py-3 ${
                        isLast
                          ? ""
                          : "border-b border-white/15"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">

                          <Icon
                            size={18}
                            className="text-white"
                          />

                        </div>

                        <span className="font-medium text-white">
                          {item.title}
                        </span>

                      </div>

                    </div>
                  );

                })}

              </div>

            </div>

            {/* Bottom Features */}

            <div className="mt-7 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-emerald-100">

              <span className="flex items-center gap-1.5">
                <Zap size={14} />
                Fast
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5">
                <Shield size={14} />
                Secure
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Reliable
              </span>

            </div>

          </div>

        </motion.div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl"
        >

          {/* ==================================================
              SIGNUP CARD
          ================================================== */}

          <div className="rounded-[32px] bg-white/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-8">

            {/* Header */}

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-lg">
                VMS
              </div>

              <h2 className="mt-6 text-3xl font-bold text-gray-800">
                Create Account
              </h2>

              <p className="mt-2 text-gray-500">
                Create your VMS account to get started.
              </p>

            </div>

            {/* ==================================================
                SIGNUP FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2"
            >

              {/* Full Name */}

              <Input
                label="Full Name"
                type="text"
                placeholder="Your name"
                icon={User}
                disabled={isSubmitting}
                {...register("name", {
                  required: "Name is required",
                })}
                error={errors.name?.message}
              />

              {/* Email */}

              <Input
                label="Email"
                type="email"
                placeholder="Your email"
                icon={Mail}
                disabled={isSubmitting}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                error={errors.email?.message}
              />

              {/* Password */}

              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                disabled={isSubmitting}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message:
                      "Password must be at least 6 characters",
                  },
                })}
                error={errors.password?.message}
              />

              {/* Confirm Password */}

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                disabled={isSubmitting}
                {...register("confirmPassword", {
                  required:
                    "Please confirm your password",
                  validate: (value) =>
                    value === password ||
                    "Passwords do not match",
                })}
                error={errors.confirmPassword?.message}
              />

              {/* Create Account Button */}

              <div className="sm:col-span-2">

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Create Account"}
                </Button>

              </div>

            </form>

            {/* Login Link */}

            <p className="mt-6 text-center text-sm text-gray-500">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={isSubmitting}
                className="cursor-pointer font-medium text-emerald-700 transition-colors hover:text-emerald-800 active:scale-95"
              >
                Login
              </button>

            </p>

            {/* Footer */}

            <p className="mt-6 text-center text-xs text-gray-400">
              &copy; 2026 Vehicle Management System
            </p>

          </div>

        </motion.div>

      </div>

    </div>
  );
}

export default Signup;
