import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ShieldX, UserPlus } from "lucide-react";
import axiosClient from "@/api/axiosClient";

const AdminSignUp = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [token, setToken] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [isValidToken, setIsValidToken] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
    receiveUpdates: false,
    receivePromotions: false,
  });

  // ----------------------------------------------
  // STEP 1 — Verify Invitation Token (Backend)
  // ----------------------------------------------
  useEffect(() => {
    const invitationToken = searchParams.get("token");
    setToken(invitationToken);

    if (!invitationToken) {
      setIsValidToken(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await axiosClient.get(
          `/admins/invite/validate?token=${invitationToken}`
        );

        setInvitation(res.data.invitation);
        setIsValidToken(true);
      } catch (err) {
        console.error("Invalid token", err);
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [searchParams]);

  // ----------------------------------------------
  // INPUT HANDLERS
  // ----------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ----------------------------------------------
  // STEP 2 — Submit → Create Admin Account
  // ----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axiosClient.post("/admins/signup-via-invite", {
        token,
        fullName: formData.fullName,
        password: formData.password,
        receiveUpdates: formData.receiveUpdates,
        receivePromotions: formData.receivePromotions,
      });

      const { admin, backendToken } = res.data;

      // Save token + user
      localStorage.setItem("token", backendToken);
      localStorage.setItem("user", JSON.stringify(admin));

      setUser(admin);

      toast({
        title: "Success!",
        description: "Your admin account is ready.",
      });

      navigate("/manager/dashboard");
    } catch (err) {
      console.error("Admin signup error:", err);

      toast({
        title: "Signup Failed",
        description:
          err.response?.data?.message ||
          "Could not complete signup. Please contact your manager.",
        variant: "destructive",
      });
    }
  };

  // ----------------------------------------------
  // UI: STATE → verifying token
  // ----------------------------------------------
  if (isValidToken === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Verifying invitation...
        </p>
      </div>
    );
  }

  // ----------------------------------------------
  // INVALID TOKEN → Show Error Screen
  // ----------------------------------------------
  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <Card className="w-full max-w-md text-center p-8 dark:bg-slate-800">
          <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl dark:text-white">
            Invalid Invitation Link
          </CardTitle>
          <CardDescription className="mt-2 dark:text-gray-400">
            This link is expired or invalid. Contact your building manager.
          </CardDescription>
          <Button asChild className="mt-6">
            <Link to="/">Go to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------
  // VALID TOKEN → SHOW SIGNUP FORM
  // ----------------------------------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md dark:bg-slate-800">
          <CardHeader className="text-center">
            <UserPlus className="w-12 h-12 mx-auto text-primary" />
            <CardTitle className="text-2xl font-bold dark:text-white">
              Create Your Admin Account
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Welcome! Complete the form below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* EMAIL (read only from invitation) */}
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={invitation.email}
                  readOnly
                  disabled
                  className="dark:bg-slate-700 dark:text-gray-400"
                />
              </div>

              {/* FULL NAME */}
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Full Name</Label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* CONFIRM */}
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Confirm Password</Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* NOTIFICATIONS */}
              <div className="space-y-2 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={formData.receiveUpdates}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("receiveUpdates", checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label className="text-sm dark:text-gray-300">
                      Receive Updates
                    </Label>
                    <p className="text-xs dark:text-gray-400">
                      System news, upgrades, announcements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={formData.receivePromotions}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("receivePromotions", checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label className="text-sm dark:text-gray-300">
                      Receive Promotions
                    </Label>
                    <p className="text-xs dark:text-gray-400">
                      Offers & promotions.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSignUp;
