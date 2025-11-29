import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserPlus,
  Eye,
  EyeOff,
  Building,
  ExternalLink,
  Phone,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";

const SocialButton = ({ provider, icon, onClick }) => (
  <Button variant="social" className="w-full" onClick={onClick}>
    {icon}
    <span>Sign up with {provider}</span>
  </Button>
);

const ResidentSignUp = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [buildingUid, setBuildingUid] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [receivePromotions, setReceivePromotions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ref = query.get("referralCode");
    const preEmail = query.get("email");
    const preName = query.get("name");
    const preUnit = query.get("unitNumber");
    const preBuilding = query.get("buildingUid");

    if (ref) setReferralCode(ref);
    if (preEmail) {
      setEmail(preEmail);
      setIsEmailEditable(false);
    }
    if (preName) setFullName(preName);
  
    // If link provided these → lock + fill
    if (preUnit) {
      setUnitNumber(preUnit);
      setIsUnitEditable(false);
    } else {
      setIsUnitEditable(true); // allow user to type manually
    }

    if (preBuilding) {
      setBuildingUid(preBuilding);
      setIsBuildingEditable(false);
    } else {
      setIsBuildingEditable(true); // allow manual input
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

if (!buildingUid || !unitNumber) {
  toast({
    title: "Invalid Invitation",
    description: "Building UID and Unit Number are required. Please use the invitation link or enter them manually.",
    variant: "destructive",
  });
  setLoading(false);
  return;
}

if (!acceptedTerms) {
  toast({
    title: "Error",
    description: "You must accept the Terms of Use.",
    variant: "destructive",
  });
  setLoading(false);
  return;
}

if (password !== confirmPassword) {
  toast({
    title: "Error",
    description: "Passwords do not match.",
    variant: "destructive",
  });
  setLoading(false);
  return;
}

// try {
//   const payload = {
//     fullName,
//     nickname,
//     email,
//     phoneNumber,
//     password,
//     referralCode,
//     unitNumber,
//     buildingUid,
//     acceptedTerms,
//   };

  // Log for debugging
  // console.log("SUBMIT PAYLOAD:", payload);

  // const res = await axiosClient.post("/residents/signup", payload);
  // const { resident, token } = res.data;

  // localStorage.setItem("token", token);
  // localStorage.setItem("resident", JSON.stringify(resident));
  // setUser(resident);

  // toast({
  //   title: "Sign Up Successful",
  //   description: `Welcome ${resident.fullName}!`,
  // });

//   navigate("/resident/dashboard");
// } catch (err) {
//   console.error("Resident signup error:", err);

//   toast({
//     title: "Sign Up Failed",
//     description: err.response?.data?.message || "Something went wrong.",
//     variant: "destructive",
//   });
// }
try {
  // اگر referralCode وجود داشت → activate
  if (referralCode) {
    const res = await axiosClient.post("/residents/activate", {
      referralCode,
      passcode: password,
    });

    const { resident, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("resident", JSON.stringify(resident));
    setUser(resident);

    toast({
      title: "Activation Successful",
      description: `Welcome ${resident.fullName}!`,
    });

    navigate("/resident/dashboard");
  } else {
    // اگر referralCode نبود → signup معمولی
    const payload = {
      fullName,
      nickname,
      email,
      phoneNumber,
      password,
      unitNumber,
      buildingUid,
      acceptedTerms,
    };

    const res = await axiosClient.post("/residents/signup", payload);
    const { resident, token } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("resident", JSON.stringify(resident));
    setUser(resident);

    toast({
      title: "Sign Up Successful",
      description: `Welcome ${resident.fullName}!`,
    });

    navigate("/resident/dashboard");
  }
} catch (err) {
  console.error("Resident signup/activate error:", err);
  toast({
    title: "Failed",
    description: err.response?.data?.message || "Something went wrong.",
    variant: "destructive",
  });
}

setLoading(false);
};
   

  const handleSocialSignUp = (provider) => {
    toast({
      title: `Sign up with ${provider}`,
      description: "Requires Supabase integration (future feature).",
      duration: 6000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg glassmorphism-card border-cyan-500/30 shadow-cyan-500/20 shadow-2xl">
          <CardHeader className="text-center">
            <Link to="/" className="inline-block mb-4">
              <Building className="w-16 h-16 mx-auto text-cyan-400 hover:text-cyan-300 transition-colors" />
            </Link>
            <CardTitle className="text-3xl font-bold text-white">
              Resident Sign Up
            </CardTitle>
            <CardDescription className="text-cyan-300">
              Join your building's community.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Nickname */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-cyan-300">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-cyan-500/50 text-white"
                  />
                </div>
                <div>
                  <Label className="text-cyan-300">Nickname (Optional)</Label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={loading}
                    className="bg-slate-800/50 border-cyan-500/50 text-white"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-cyan-300">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || !isEmailEditable}
                    readOnly={!isEmailEditable}
                    className="bg-slate-800/50 border-cyan-500/50 text-white"
                  />
                </div>
                <div>
                  <Label className="text-cyan-300">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={loading}
                      className="bg-slate-800/50 border-cyan-500/50 pl-10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label className="text-cyan-300">Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-slate-800/50 border-cyan-500/50 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-0 right-0 px-3 py-2 text-cyan-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <Label className="text-cyan-300">Confirm Password</Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                                        className="bg-slate-800/50 border-cyan-500/50 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute bottom-0 right-0 px-3 py-2 text-cyan-400"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <Label className="text-cyan-300">Invitation / Referral Code</Label>
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={loading || !isEmailEditable}
                  readOnly={!isEmailEditable}
                  className="bg-slate-800/50 border-cyan-500/50 text-white"
                />
              </div>

              {/* Unit Number */}
              <div>
                <Label className="text-cyan-300">Assigned Unit</Label>
                <Input
                  value={unitNumber || "Via Invitation"}
                  disabled
                  readOnly
                  className="bg-slate-700/50 border-cyan-600/50 text-gray-300"
                />
              </div>

              {/* Terms Checkbox */}
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                    disabled={loading}
                  />
                  <Label className="text-cyan-300 text-sm">
                    I accept the Terms of Use & Privacy Policy.
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-lg"
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <UserPlus className="mr-2" /> Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Social Sign Up */}
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-cyan-500/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/80 px-2 text-cyan-300">
                    Or sign up with
                  </span>
                </div>
              </div>

              <SocialButton
                provider="Google"
                icon={<ExternalLink size={18} />}
                onClick={() => handleSocialSignUp("Google")}
              />
              <SocialButton
                provider="Apple"
                icon={<ExternalLink size={18} />}
                onClick={() => handleSocialSignUp("Apple")}
              />
              <SocialButton
                provider="Microsoft"
                icon={<ExternalLink size={18} />}
                onClick={() => handleSocialSignUp("Microsoft")}
              />
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col items-center gap-2">
            <p className="text-sm text-cyan-300">
              Already have an account?{" "}
              <Link
                to="/login/resident"
                className="text-cyan-200 underline"
              >
                Login
              </Link>
            </p>
            <Link to="/" className="text-sm text-cyan-300 underline">
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResidentSignUp;
