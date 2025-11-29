
// src/pages/ResidentLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserCheck,
  Eye,
  EyeOff,
  Building,
  MailQuestion,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";

const SocialButton = ({ provider, icon, onClick }) => (
  <Button variant="social" className="w-full" onClick={onClick}>
    {icon}
    <span>Sign in with {provider}</span>
  </Button>
);

const ResidentLogin = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // -------------------------------
  // SUBMIT → BACKEND LOGIN
  // -------------------------------
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const res = await axiosClient.post("/residents/login", {
  //       email,
  //       password,
  //     });

  //     const { resident, token } = res.data;

  //     localStorage.setItem("token", token);
  //     localStorage.setItem("resident", JSON.stringify(resident));
  //     setUser(resident);

  //     toast({
  //       title: "Login Successful",
  //       description: "Welcome back!",
  //     });

  //     navigate("/resident/dashboard");
  //   } catch (err) {
  //     console.error("Resident login error:", err);

  //     toast({
  //       title: "Login Failed",
  //       description:
  //         err.response?.data?.message ||
  //         (err.code === "ECONNABORTED"
  //           ? "Request timed out. Please try again."
  //           : err.message || "Unexpected error occurred."),
  //       variant: "destructive",
  //     });
  //   }

  //   setLoading(false);
  // };
// SUBMIT → BACKEND LOGIN
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axiosClient.post("/residents/login", {
      email,
      password,
    });

    const { resident, token } = res.data;

    // ------------------------------------------------------
    // 🔥 FIX #1: همه جلسات قبلی (خصوصاً مدیر) را پاک می‌کنیم
    // ------------------------------------------------------
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ------------------------------------------------------
    // 🔥 FIX #2: ذخیره درست توکن رزیدنت
    // ------------------------------------------------------
    localStorage.setItem("token", token);

    // ------------------------------------------------------
    // 🔥 FIX #3 (خیلی مهم): ذخیره user مطابق چیزی که AuthGuard می‌خواند
    // ------------------------------------------------------
    const normalizedUser = {
      ...resident,
      role: "resident",     // ⬅ نقش را صریحاً ست می‌کنیم
    };
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    // ------------------------------------------------------
    // 🔥 FIX #4: setUser باید همان user ذخیره شده باشد
    // ------------------------------------------------------
    setUser(normalizedUser);

    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });

    navigate("/resident/dashboard");
  } catch (err) {
    console.error("Resident login error:", err);

    toast({
      title: "Login Failed",
      description:
        err.response?.data?.message ||
        (err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : err.message || "Unexpected error occurred."),
      variant: "destructive",
    });
  }

  setLoading(false);
};

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description:
        "Password recovery will be enabled soon. For now, contact your building manager.",
      duration: 5500,
    });
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: `Sign in with ${provider}`,
      description: "Will be enabled when Supabase integration is completed.",
      duration: 6000,
    });
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md glassmorphism-card border-green-500/30 shadow-green-500/20 shadow-2xl">
          <CardHeader className="text-center">
            <Link to="/" className="inline-block mb-4">
              <Building className="w-16 h-16 mx-auto text-green-400 hover:text-green-300 transition-colors" />
            </Link>
            <CardTitle className="text-3xl font-bold text-white">
              Resident Login
            </CardTitle>
            <CardDescription className="text-green-300">
              Access your apartment services.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-green-300">Email Address</Label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-green-500/50 text-white placeholder-green-400/70 focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-300">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-green-500/50 text-white placeholder-green-400/70 focus:border-green-400 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-green-400 hover:text-green-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="text-xs text-green-300 hover:text-green-200 p-0 h-auto"
                  >
                    <MailQuestion className="mr-1 h-3 w-3" />
                    Forgot Password?
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 neumorphism-button border-none"
              >
                {loading ? "Logging in..." : (
                  <>
                    <UserCheck className="mr-2" /> Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-green-500/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/80 px-2 text-green-300">
                    Or continue with
                  </span>
                </div>
              </div>

              <SocialButton
                provider="Google"
                icon={<ExternalLink size={18} className="text-red-500" />}
                onClick={() => handleSocialLogin("Google")}
              />
              <SocialButton
                provider="Apple"
                icon={<ExternalLink size={18} className="text-gray-500" />}
                onClick={() => handleSocialLogin("Apple")}
              />
                           <SocialButton
                provider="Microsoft"
                icon={<ExternalLink size={18} className="text-blue-500" />}
                onClick={() => handleSocialLogin("Microsoft")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-green-300">
              New resident?{" "}
              <Link
                to="/signup/resident"
                className="font-medium text-green-200 hover:text-green-100 hover:underline"
              >
                Sign Up
              </Link>
            </p>

            <Link
              to="/login/manager"
              className="text-sm text-green-300 hover:text-green-200 hover:underline"
            >
              Are you a manager? Login here.
            </Link>

            <Link
              to="/"
              className="text-sm text-green-300 hover:text-green-200 hover:underline"
            >
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResidentLogin;
