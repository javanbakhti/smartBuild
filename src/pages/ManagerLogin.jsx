// ===========================================
// ManagerLogin.jsx — FINAL FIXED VERSION
// ===========================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, Eye, EyeOff, Building, MailQuestion, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axiosClient from '@/api/axiosClient';

// For reusability of social login UI
const SocialButton = ({ provider, icon, onClick }) => (
  <Button variant="social" className="w-full" onClick={onClick}>
    {icon}
    <span>Sign in with {provider}</span>
  </Button>
);

const ManagerLogin = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
// ===========================
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axiosClient.post('/auth/login', {
      email,
      password
    });

    const { token, manager } = response.data;


    if (!manager) {
      throw new Error("Server did not return manager data");
    }
    const safeManager = {
      ...manager,
      fullName: manager.fullName || "",
      nickname: manager.nickname || "",
      buildingUid: manager.buildingUid || "",
      id: manager.id || manager._id || "",
      role: manager.role || "",
    };
    localStorage.setItem("token", token);
    localStorage.setItem("manager", JSON.stringify(safeManager));
   

    setUser(safeManager);  
    localStorage.setItem("user", JSON.stringify(safeManager));   

    toast({
      title: 'Login Successful',
      description: `Welcome back, ${safeManager.fullName}!`,
    });

    navigate('/manager/dashboard');

  } catch (error) {
    console.error("Login Error:", error);

    toast({
      title: 'Login Failed',
      description:
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password.",
      variant: 'destructive',
    });
  }

  setLoading(false);
};


  // Forgotten password placeholder
  const handleForgotPassword = () => {
    toast({
      title: "Coming Soon",
      description: "Password recovery is not available yet.",
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="w-full max-w-md glassmorphism-card border-blue-500/30 shadow-2xl shadow-blue-500/20">
          
          <CardHeader className="text-center">
            <Link to="/" className="inline-block mb-4">
              <Building className="w-16 h-16 mx-auto text-blue-400 hover:text-blue-300 transition" />
            </Link>

            <CardTitle className="text-3xl font-bold text-white">
              Manager Login
            </CardTitle>

            <CardDescription className="text-blue-300">
              Access the building management dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-blue-300">Email Address</Label>
                <Input
                  type="email"
                  placeholder="manager@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-blue-500/50 text-white placeholder-blue-400/60 focus:border-blue-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-blue-300">Password</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white focus:border-blue-400 pr-10"
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-blue-400 hover:text-blue-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="text-xs text-blue-300 hover:text-blue-200 p-0"
                  >
                    <MailQuestion size={14} className="mr-1" />
                    Forgot Password?
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg transition-all duration-300 hover:scale-105"
              >
                {loading ? "Logging in..." : <><UserCog className="mr-2" /> Login</>}
              </Button>

            </form>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-blue-300">
              New manager?{" "}
              <Link to="/signup/manager" className="text-blue-100 underline">
                Create Building Account
              </Link>
            </p>

            <Link to="/login/resident" className="text-sm text-blue-300 hover:text-blue-200 underline">
              Resident Login
            </Link>

            <Link to="/" className="text-sm text-blue-300 hover:text-blue-200 underline">
              Back to Home
            </Link>
          </CardFooter>

        </Card>
      </motion.div>

    </div>
  );
};

export default ManagerLogin;
