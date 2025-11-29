// src/pages/ManagerSignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, Building as BuildingIcon, Phone, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axiosClient from '@/api/axiosClient';   // ⭐ اضافه شد 

const SocialButton = ({ provider, icon, onClick }) => (
  <Button variant="social" className="w-full" onClick={onClick}>
    {icon}
    <span>Sign up with {provider}</span>
  </Button>
);

const ManagerSignUp = ({ setUser }) => {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [buildingUid, setBuildingUid] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [receivePromotions, setReceivePromotions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ======================================================
  // ⭐ REAL BACKEND SIGNUP FUNCTION
  // ======================================================
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axiosClient.post("/managers/signup", {
      fullName,
      nickname,
      email,
      phoneNumber,
      password,
      buildingUid,
      acceptedTerms,
      receiveUpdates,
      receivePromotions
    });

    const { token, manager } = response.data;

    const safeManager = {
      id: manager.id || manager._id || "",
      fullName: manager.fullName || "",
      nickname: manager.nickname || "",
      email: manager.email || "",
      role: manager.role || "manager",
      buildingUid: manager.buildingUid || buildingUid,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("manager", JSON.stringify(safeManager));

    setUser(safeManager);

    toast({
      title: "Account Created!",
      description: "Your manager account has been created successfully.",
    });

    navigate('/manager/building-setup');

  } catch (error) {
    console.error("Signup Error:", error);
    console.error("Error response:", error.response?.data);

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Unable to create your account. Please check all fields and try again.";

    toast({
      title: "Sign Up Failed",
      description: errorMessage,
      variant: "destructive",
    });
  }

  setLoading(false);
};

  const handleSocialSignUp = (provider) => {
    toast({
      title: `Sign up with ${provider}`,
      description: `This feature requires Supabase integration.`,
      duration: 6000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-lg glassmorphism-card border-blue-500/30 shadow-blue-500/20 shadow-2xl">
          <CardHeader className="text-center">
            <Link to="/" className="inline-block mb-4">
              <BuildingIcon className="w-16 h-16 mx-auto text-blue-400 hover:text-blue-300 transition-colors" />
            </Link>
            <CardTitle className="text-3xl font-bold text-white">Building Manager Sign Up</CardTitle>
            <CardDescription className="text-blue-300">
              Create your account to manage your building's intercom system.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name + Nickname */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-blue-300">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-blue-300">Nickname (Optional)</Label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-blue-300">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1 relative">
                  <Label className="text-blue-300">Phone Number (Optional)</Label>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400/70" />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white pl-10 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Building UID */}
              <div className="space-y-1">
                <Label className="text-blue-300">Building UID (Device Serial Number)</Label>
                <Input
                  value={buildingUid}
                  onChange={(e) => setBuildingUid(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-800/50 border-blue-500/50 text-white focus:border-blue-400"
                />
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <Label className="text-blue-300">Password</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white pr-10 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-0 right-0 px-3 py-2 text-blue-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="space-y-1 relative">
                  <Label className="text-blue-300">Confirm Password</Label>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-blue-500/50 text-white pr-10 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute bottom-0 right-0 px-3 py-2 text-blue-400"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
                  <Label className="text-sm text-blue-300">
                    I accept the <a href="#" className="underline text-blue-200">Terms of Use</a>.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox checked={receiveUpdates} onCheckedChange={setReceiveUpdates} />
                  <Label className="text-sm text-blue-300">Receive Updates</Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox checked={receivePromotions} onCheckedChange={setReceivePromotions} />
                  <Label className="text-sm text-blue-300">Receive Promotions</Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {loading ? "Creating Account..." : <><Shield className="mr-2 h-5 w-5" /> Create Account</>}
              </Button>
            </form>

            {/* Social signup */}
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-500/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/80 px-2 text-blue-300">Or sign up with</span>
                </div>
              </div>

              <SocialButton provider="Google" icon={<ExternalLink size={18} />} onClick={() => handleSocialSignUp('Google')} />
              <SocialButton provider="Apple" icon={<ExternalLink size={18} />} onClick={() => handleSocialSignUp('Apple')} />
              <SocialButton provider="Microsoft" icon={<ExternalLink size={18} />} onClick={() => handleSocialSignUp('Microsoft')} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-blue-300">
              Already have an account?{' '}
              <Link to="/login/manager" className="text-blue-200 underline">Login</Link>
            </p>
            <Link to="/" className="text-sm text-blue-300 underline">Back to Home</Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ManagerSignUp;
