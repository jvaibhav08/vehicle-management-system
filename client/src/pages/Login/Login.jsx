import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import {
  Car,
  Mail,
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

function Login() {

const navigate = useNavigate();
const { login } = useAuth();
const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
  try {
    const response = await loginService(data);

    if (!response.success) {
      showToast(response.message, "error");
      return;
    }

    login(
      {
        email: data.email,
      },
      response.token
    );

    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong", "error");
  }
};

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

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700">
      {/* Animated Background */}

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

      {/* Dot grid accents */}
      <div className="pointer-events-none absolute -right-6 top-8 h-40 w-40 opacity-40 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="pointer-events-none absolute -left-6 bottom-6 h-40 w-40 opacity-40 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 mx-auto flex h-screen max-w-7xl items-center justify-between gap-16 px-8 lg:px-12">
        {/* LEFT SIDE */}

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden flex-1 lg:block"
        >
          <div className="max-w-xl">
            <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md">
              <Car size={42} className="text-white" />
            </div>

            <h1 className="text-5xl font-bold leading-tight text-white">
              Vehicle
              <br />
              Management
              <br />
              System
            </h1>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 max-w-[90px] bg-white/30" />
              <ShieldCheck size={16} className="text-white/70" />
              <span className="h-px flex-1 max-w-[90px] bg-white/30" />
            </div>

            <p className="max-w-md text-lg leading-8 text-emerald-100">
              Manage your vehicles, insurance, PUC and RC records from one
              secure dashboard.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-md">
                {features.map((item, idx) => {
                  const Icon = item.icon;
                  const isLast = idx === features.length - 1;

                  return (
                    <div
                      key={item.title}
                      className={`flex items-center justify-between py-3 ${
                        isLast ? "" : "border-b border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                          <Icon size={18} className="text-white" />
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

        {/* RIGHT SIDE */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md"
        >
          <div className="rounded-[32px] bg-white/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-lg">
                VMS
              </div>

              <h2 className="mt-6 text-3xl font-bold text-gray-800">
                Welcome Back
              </h2>

              <p className="mt-2 text-gray-500">
                Sign in to continue to your dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 space-y-4"
            >
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                icon={Mail}
                {...register("email", {
                  required: "Email is required",
                })}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
                error={errors.password?.message}
              />

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Remember Me
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit">Login</Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              &copy; 2026 Vehicle Management System
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
