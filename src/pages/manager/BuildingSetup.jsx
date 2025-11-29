import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DoorOpen, Info, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import axiosClient from "@/api/axiosClient";    
import { useNavigate } from "react-router-dom";
import { log } from "console";

const buildingSetup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [buildingUID, setBuildingUID] = useState("");
  const [managerFullName, setManagerFullName] = useState("");
  const [managerNickname, setManagerNickname] = useState("");

  const [buildingName, setBuildingName] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");

  const [floorCount, setFloorCount] = useState(8);
  const [unitsPerFloor, setUnitsPerFloor] = useState(4);
  const [doorCount, setDoorCount] = useState(0);

  // =========================
  // Load existing building
  // =========================
  useEffect(() => {
    const loadExisting = async () => {
      try {
        const manager = JSON.parse(localStorage.getItem("manager"));

        if (!manager || !manager.buildingUid) {
          console.log("No manager or buildingUid");
          setInitialLoading(false);
          return;
        }

        const uid = manager.buildingUid;
        setBuildingUID(uid);

        // GET /api/building/:buildingUid
        const res = await axiosClient.get(`/building/${uid}`);
        console.log("Existing building data:", res.data);
        if (res.data?.building) {
          const b = res.data.building;

          setBuildingUID(b.buildingUid || "");
          setManagerFullName(b.managerFullName || "");
          setManagerNickname(b.managerNickname || "");
          setBuildingName(b.buildingName || "");
          setBuildingAddress(b.buildingAddress || "");
          setFloorCount(b.floorCount || 8);
          setUnitsPerFloor(b.unitsPerFloor || 4);
          setDoorCount(b.doorCount || 0);
        }
      } catch (err) {
        // 404 = عادی، یعنی هنوز هیچ بیلدینگی برای این UID ذخیره نشده
        console.log("No existing building OR API error:", err?.response?.data || err.message);
      }

      setInitialLoading(false);
    };

    loadExisting();
  }, []);

  // =========================
  // Submit building config
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buildingName || !buildingAddress || !managerFullName || floorCount <= 0 || unitsPerFloor <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const manager = JSON.parse(localStorage.getItem("manager"));

      const payload = {
        managerId: manager?._id,                     
        buildingUid: buildingUID || manager?.buildingUid, 
        buildingName,
        buildingAddress,
        managerFullName,
        managerNickname,
        floorCount,
        unitsPerFloor,
        totalUnits: floorCount * unitsPerFloor,
        doorCount,
        units: [],                              
      };

      // POST /api/building/save
      const res = await axiosClient.post("/building/save", payload);

      toast({
        title: "Saved Successfully!",
        description: "Your building details have been updated.",
      });

      navigate("/manager/manage-units");
    } catch (err) {
      toast({
        title: "API Error",
        description: err?.response?.data?.message || "Server error occurred.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (initialLoading) {
    return (
      <Layout role="manager">
        <div className="flex justify-center items-center h-96 text-gray-400">
          Loading building...
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="manager">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-3xl mx-auto p-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Building Setup</h1>
          <p className="text-muted-foreground">Configure your building information.</p>
        </div>

        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white">
              <Building className="mr-2 h-6 w-6 text-primary" /> Building Information
            </CardTitle>
            <CardDescription>Enter the core details about your apartment building.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {buildingUID && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Building UID: <span className="font-semibold">{buildingUID}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="dark:text-gray-300">Manager Full Name</Label>
                  <Input
                    value={managerFullName}
                    onChange={(e) => setManagerFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Manager Nickname</Label>
                  <Input
                    value={managerNickname}
                    onChange={(e) => setManagerNickname(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-300">Building Name</Label>
                <Input
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="dark:text-gray-300">Building Address</Label>
                <Input
                  value={buildingAddress}
                  onChange={(e) => setBuildingAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="dark:text-gray-300">Number of Floors</Label>
                  <Input
                    type="number"
                    min="1"
                    value={floorCount}
                    onChange={(e) => setFloorCount(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Units Per Floor</Label>
                  <Input
                    type="number"
                    min="1"
                    value={unitsPerFloor}
                    onChange={(e) => setUnitsPerFloor(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center dark:text-gray-300">
                  <DoorOpen className="mr-2 h-5 w-5 text-primary" /> Entrances & Doors
                </Label>
                <p className="text-sm text-muted-foreground">
                  Total Doors Configured: {doorCount}.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="mt-2 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700"
                >
                  <a href="/manager/manage-doors">Go to Manage Doors</a>
                </Button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default buildingSetup;
///// src/pages/manager/buildingetup.jsx