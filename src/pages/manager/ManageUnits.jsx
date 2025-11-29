// import React, { useState, useEffect, useCallback, useMemo } from 'react';
//     import Layout from '@/components/Layout';
//     import { useToast } from '@/components/ui/use-toast';
//     import { motion } from 'framer-motion';
//     import ManageUnitsHeader from '@/components/manager/units/ManageUnitsHeader';
//     import UnitList from '@/components/manager/units/UnitList';
//     import UnitFormDialog from '@/components/manager/units/UnitFormDialog';
//     import ManageGroups from '@/components/manager/units/ManageGroups';
//     import ManageCommonAreas from '@/components/manager/units/ManageCommonAreas';
//     import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
//     import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
//     import { Button } from '@/components/ui/button';
//     import { Info, Users, Grid3X3, MapPinned } from 'lucide-react';
//     import { useTour } from '@/contexts/TourContext';

//     const manageUnitsTourSteps = [
//       {
//         id: 'mu-welcome',
//         title: 'Manage Units, Groups & Common Areas',
//         description: 'This section allows you to define individual units, organize them into groups, and manage shared common areas.',
//         targetId: null,
//         placement: 'center',
//       },
//       {
//         id: 'mu-tabs',
//         title: 'Units, Groups & Common Areas Tabs',
//         description: 'Switch between managing individual units, creating/managing unit groups, and configuring common areas using these tabs.',
//         targetId: 'units-groups-common-areas-tabs', 
//         placement: 'bottom',
//       },
//       {
//         id: 'mu-add-unit-button',
//         title: 'Add New Unit',
//         description: 'Click here to manually add a new unit if it wasn\'t auto-generated or if you need specific configurations.',
//         targetId: 'add-unit-button', 
//         placement: 'bottom',
//         navigateTo: '/manager/manage-units' 
//       },
//       {
//         id: 'mu-unit-list',
//         title: 'Unit List',
//         description: 'View all defined units. You can edit or delete units from here. Note if a unit is already assigned to a resident.',
//         targetId: 'unit-list-card', 
//         placement: 'top',
//         navigateTo: '/manager/manage-units'
//       },
//       {
//         id: 'mu-groups-tab-trigger',
//         title: 'Manage Groups',
//         description: 'Click this tab to switch to the group management view.',
//         targetId: 'groups-tab-trigger', 
//         placement: 'bottom',
//       },
//       {
//         id: 'mu-common-areas-tab-trigger',
//         title: 'Manage Common Areas',
//         description: 'Click this tab to configure shared spaces like gyms or pools.',
//         targetId: 'common-areas-tab-trigger',
//         placement: 'bottom',
//       },
//     ];


//     const ManageUnits = () => {
//       const { toast } = useToast();
//       const { startTour } = useTour();

//       const [buildingUnits, setBuildingUnits] = useState([]);
//       const [residents, setResidents] = useState([]);
//       const [buildingDetails, setBuildingDetails] = useState({});
//       const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
//       const [editingUnit, setEditingUnit] = useState(null);
//       const [searchTerm, setSearchTerm] = useState('');
//       const [manager, setManager] = useState(null); 
      
//       const [unitFormData, setUnitFormData] = useState({
//         id: '', 
//         identifier: '',
//         floor: '',
//         label: ''
//       });

//       useEffect(() => {
//         startTour('manageUnitsAndGroups', manageUnitsTourSteps);
//       }, [startTour]);

//       useEffect(() => {
//         const currentManagerString = localStorage.getItem('user');
//         if (currentManagerString) {
//           try {
//             const currentManager = JSON.parse(currentManagerString);
//             setManager(currentManager); 
//           } catch (e) {
//             console.error("Failed to parse manager data from localStorage", e);
//             setManager(null);
//           }
//         } else {
//           setManager(null);
//         }

//         const storedBuildingDetails = JSON.parse(localStorage.getItem('buildingDetails')) || {};
//         setBuildingDetails(storedBuildingDetails);
        
//         const storedUnits = JSON.parse(localStorage.getItem('buildingUnits')) || [];
//         const storedResidents = JSON.parse(localStorage.getItem('residents')) || [];
//         setResidents(storedResidents);

//         if (storedUnits.length === 0 && storedBuildingDetails.floorCount && storedBuildingDetails.unitsPerFloor) {
//           generateInitialUnits(storedBuildingDetails.floorCount, storedBuildingDetails.unitsPerFloor);
//         } else {
//           setBuildingUnits(storedUnits);
//         }
//       }, []);

//       const generateInitialUnits = (floorCount, unitsPerFloor) => {
//         const newUnits = [];
//         const useThreeDigitFormat = floorCount >= 10;

//         for (let floor = 1; floor <= floorCount; floor++) {
//           for (let unitIdx = 1; unitIdx <= unitsPerFloor; unitIdx++) {
//             let unitId;
//             if (useThreeDigitFormat) {
//               unitId = `${floor}0${unitIdx}`;
//               if (unitIdx >= 10) { // Handles cases like 10+ units per floor
//                 unitId = `${floor}${unitIdx}`;
//               }
//             } else {
//               unitId = `${floor}${unitIdx}`;
//             }
            
//             newUnits.push({
//               id: `${floor}-${unitId}-${Date.now()}-${Math.random()}`, 
//               identifier: unitId,
//               floor: floor.toString(),
//               label: '', 
//               isAssigned: false, 
//             });
//           }
//         }
//         saveUnits(newUnits);
//       };
      
//       const saveUnits = (updatedUnits) => {
//         localStorage.setItem('buildingUnits', JSON.stringify(updatedUnits));
//         setBuildingUnits(updatedUnits);
//       };

//       const saveResidentsLocalStorage = (updatedResidents) => {
//         localStorage.setItem('residents', JSON.stringify(updatedResidents));
//         setResidents(updatedResidents);
//       }

//       const resetForm = () => {
//         setUnitFormData({ id: '', identifier: '', floor: '', label: '' });
//         setEditingUnit(null);
//       };

//       const handleFormInputChange = (e) => {
//         const { name, value } = e.target;
//         setUnitFormData(prev => ({ ...prev, [name]: name === 'identifier' ? value.toUpperCase() : value }));
//       };
      
//       const handleSubmitUnit = () => {
//         const { id: currentUnitId, identifier: newIdentifier, floor, label } = unitFormData;
//         if (!newIdentifier.trim() || !floor.trim()) {
//           toast({ title: "Error", description: "Unit Identifier and Floor are required.", variant: "destructive" });
//           return;
//         }

//         if (editingUnit) {
//           const oldIdentifier = editingUnit.identifier;
//           const updatedUnits = buildingUnits.map(u => 
//             u.id === editingUnit.id ? { ...u, identifier: newIdentifier, floor, label } : u
//           );
//           saveUnits(updatedUnits);

//           if (oldIdentifier !== newIdentifier) {
//             const updatedResidents = residents.map(r => {
//               if (r.unitNumber === oldIdentifier) {
//                 return { ...r, unitNumber: newIdentifier, floorNumber: floor };
//               }
//               return r;
//             });
//             saveResidentsLocalStorage(updatedResidents);
//           }
//           toast({ title: "Unit Updated", description: `Unit "${newIdentifier}" has been updated.` });
//         } else {
//           if (buildingUnits.some(u => u.identifier === newIdentifier && u.floor === floor)) {
//             toast({ title: "Error", description: `Unit "${newIdentifier}" on floor ${floor} already exists.`, variant: "destructive" });
//             return;
//           }
//           const newUnit = {
//             id: `${floor}-${newIdentifier}-${Date.now()}`,
//             identifier: newIdentifier,
//             floor,
//             label,
//             isAssigned: false, 
//           };
//           saveUnits([...buildingUnits, newUnit]);
//           toast({ title: "Unit Added", description: `Unit "${newIdentifier}" has been added to floor ${floor}.` });
//         }
//         resetForm();
//         setIsFormDialogOpen(false);
//       };

//       const handleEditUnit = (unit) => {
//         setEditingUnit(unit);
//         setUnitFormData({
//             id: unit.id, 
//             identifier: unit.identifier,
//             floor: unit.floor,
//             label: unit.label || ''
//         });
//         setIsFormDialogOpen(true);
//       };

//       const handleDeleteUnit = (unitId) => {
//         const unitToDelete = buildingUnits.find(u => u.id === unitId);
//         const isAssigned = getUnitAssignmentStatus(unitToDelete?.identifier);

//         if (isAssigned) {
//           toast({ title: "Error", description: "Cannot delete a unit that is assigned to a resident.", variant: "destructive" });
//           return;
//         }
//         if (window.confirm("Are you sure you want to remove this unit? This action cannot be undone if not assigned.")) {
//           saveUnits(buildingUnits.filter(u => u.id !== unitId));
//           toast({ title: "Unit Removed", description: "The unit has been removed.", variant: "destructive" });
//         }
//       };
      
//       const getUnitAssignmentStatus = useCallback((unitIdentifier) => {
//         return residents.some(resident => resident.unitNumber === unitIdentifier);
//       }, [residents]);

//       const unitsWithStatus = useMemo(() => {
//         return buildingUnits.map(unit => ({
//           ...unit,
//           isAssigned: getUnitAssignmentStatus(unit.identifier)
//         }));
//       }, [buildingUnits, getUnitAssignmentStatus, residents]);


//       const filteredUnits = unitsWithStatus.filter(unit =>
//         unit.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         unit.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (unit.label && unit.label.toLowerCase().includes(searchTerm.toLowerCase()))
//       ).sort((a,b) => { 
//         const floorA = parseInt(a.floor, 10);
//         const floorB = parseInt(b.floor, 10);
//         if (isNaN(floorA) && !isNaN(floorB)) return 1; 
//         if (!isNaN(floorA) && isNaN(floorB)) return -1;
//         if (floorA < floorB) return -1;
//         if (floorA > floorB) return 1;
        
//         const identA = a.identifier.toLowerCase();
//         const identB = b.identifier.toLowerCase();
//         if (identA < identB) return -1;
//         if (identA > identB) return 1;
//         return 0;
//       });

//       return (
//         <Layout role="manager">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="space-y-6 p-4 md:p-6 lg:p-8"
//           >
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//               <div>
//                 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 dark:text-white">Manage Units, Groups & Common Areas</h1>
//                 <p className="text-md md:text-lg text-muted-foreground">Define units, organize them into groups, and manage shared common areas.</p>
//               </div>
//             </div>
            
//             {!buildingDetails.floorCount && (
//               <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
//                 <CardHeader className="flex flex-row items-center space-x-3">
//                   <Info className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
//                   <div>
//                     <CardTitle className="text-yellow-700 dark:text-yellow-300">Building Setup Needed</CardTitle>
//                     <CardDescription className="text-yellow-600 dark:text-orange-400">
//                       Please set up floor and unit counts in "Building Setup" to auto-generate units. You can still add units manually.
//                     </CardDescription>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
//                     <a href="/manager/building-setup">Go to Building Setup</a>
//                   </Button>
//                 </CardContent>
//               </Card>
//             )}

//             <Tabs defaultValue="units" className="w-full">
//               <TabsList id="units-groups-common-areas-tabs" className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3 gap-2 dark:bg-slate-700 p-1 rounded-lg">
//                 <TabsTrigger value="units" className="px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:text-gray-300">
//                   <Grid3X3 className="mr-2 h-4 w-4 inline-block"/> Units
//                 </TabsTrigger>
//                 <TabsTrigger id="groups-tab-trigger" value="groups" className="px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:text-gray-300">
//                   <Users className="mr-2 h-4 w-4 inline-block"/> Groups
//                 </TabsTrigger>
//                 <TabsTrigger id="common-areas-tab-trigger" value="common-areas" className="px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:text-gray-300">
//                   <MapPinned className="mr-2 h-4 w-4 inline-block"/> Common Areas
//                 </TabsTrigger>
//               </TabsList>
//               <TabsContent value="units" className="mt-6">
//                 <ManageUnitsHeader 
//                     onAddUnitClick={() => { resetForm(); setIsFormDialogOpen(true); }}
//                     searchTerm={searchTerm}
//                     onSearchTermChange={setSearchTerm}
//                 />
//                 <Card id="unit-list-card" className="dark:bg-slate-800 shadow-lg mt-4">
//                   <CardHeader><CardTitle className="dark:text-white">Unit Overview</CardTitle></CardHeader>
//                   <CardContent>
//                     <UnitList 
//                         units={filteredUnits}
//                         onEditUnit={handleEditUnit}
//                         onDeleteUnit={handleDeleteUnit}
//                     />
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//               <TabsContent value="groups" className="mt-6">
//                 <ManageGroups 
//                   buildingUnits={buildingUnits} 
//                   residents={residents}
//                   manager={manager} 
//                 />
//               </TabsContent>
//               <TabsContent value="common-areas" className="mt-6">
//                 <ManageCommonAreas manager={manager} />
//               </TabsContent>
//             </Tabs>
            
//             <UnitFormDialog
//                 isOpen={isFormDialogOpen}
//                 onOpenChange={(isOpen) => {
//                     setIsFormDialogOpen(isOpen);
//                     if (!isOpen) resetForm();
//                 }}
//                 unitData={unitFormData}
//                 onInputChange={handleFormInputChange}
//                 onSubmit={handleSubmitUnit}
//                 isEditing={!!editingUnit}
//             />

//           </motion.div>
//         </Layout>
//       );
//     };

//     export default ManageUnits;
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import ManageUnitsHeader from "@/components/manager/units/ManageUnitsHeader";
import UnitList from "@/components/manager/units/UnitList";
import UnitFormDialog from "@/components/manager/units/UnitFormDialog";
import ManageGroups from "@/components/manager/units/ManageGroups";
import ManageCommonAreas from "@/components/manager/units/ManageCommonAreas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Users, Grid3X3, MapPinned } from "lucide-react";
import axios from "@/lib/axiosClient";
import { useTour } from "@/contexts/TourContext";

const ManageUnits = () => {
  const { toast } = useToast();
  const { startTour } = useTour();

  const [buildingUnits, setBuildingUnits] = useState([]);
  const [buildingDetails, setBuildingDetails] = useState({});
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [unitFormData, setUnitFormData] = useState({
    identifier: "",
    floor: "",
    label: "",
  });

  const [loadingUnits, setLoadingUnits] = useState(false);

  // ============================================
  // Load Manager + Building
  // ============================================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    setBuildingDetails({ buildingUid: user.buildingUid });
    loadUnits(user.buildingUid);
  }, []);

  // ============================================
  // Load Units from API
  // ============================================
  const loadUnits = async (buildingUid) => {
    try {
      setLoadingUnits(true);
      const res = await axios.get(`/units/${buildingUid}`);
      setBuildingUnits(res.data.units || []);
    } catch (err) {
      toast({
        title: "Error Loading Units",
        description: err.response?.data?.message || "Server error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoadingUnits(false);
    }
  };

  // ============================================
  // Input Change
  // ============================================
  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setUnitFormData((prev) => ({
      ...prev,
      [name]: name === "identifier" ? value.toUpperCase() : value,
    }));
  };

  // ============================================
  // Add / Update Unit
  // ============================================
  const handleSubmitUnit = async () => {
    const { identifier, floor, label } = unitFormData;
    const buildingUid = buildingDetails.buildingUid;

    if (!identifier.trim() || !floor.trim()) {
      return toast({
        title: "Error",
        description: "Unit Identifier and Floor are required.",
        variant: "destructive",
      });
    }

    // UPDATE
    if (editingUnit) {
      try {
        const res = await axios.put(`/units/${editingUnit._id}`, {
          identifier,
          floor,
          label,
        });

        toast({ title: "Updated!", description: res.data.message });

        loadUnits(buildingUid);
        setIsFormDialogOpen(false);
        setEditingUnit(null);
      } catch (err) {
        toast({
          title: "Update Failed",
          description: err.response?.data?.message || "Server error",
          variant: "destructive",
        });
      }
      return;
    }

    // ADD
    try {
      const res = await axios.post("/units", {
        buildingUid,
        identifier,
        floor,
        label,
      });

      toast({ title: "Added!", description: res.data.message });

      loadUnits(buildingUid);
      setIsFormDialogOpen(false);
    } catch (err) {
      toast({
        title: "Add Failed",
        description: err.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  // ============================================
  // Edit Unit
  // ============================================
  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitFormData({
      identifier: unit.identifier,
      floor: unit.floor,
      label: unit.label || "",
    });
    setIsFormDialogOpen(true);
  };

  // ============================================
  // Delete Unit
  // ============================================
  const handleDeleteUnit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;

    try {
      const res = await axios.delete(`/units/${id}`);
      toast({ title: "Deleted", description: res.data.message });

      loadUnits(buildingDetails.buildingUid);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  // ============================================
  // Filtered Units (Search)
  // ============================================
  const filteredUnits = useMemo(() => {
    return buildingUnits.filter((unit) =>
      unit.identifier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [buildingUnits, searchTerm]);

  return (
    <Layout role="manager">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 p-4 md:p-6 lg:p-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white">
            Manage Units, Groups & Common Areas
          </h1>
          <p className="text-gray-400">
            Manage your building’s units and group structure.
          </p>
        </div>

        {/* TABS */}
        <Tabs defaultValue="units">
          <TabsList className="grid grid-cols-3 gap-2 dark:bg-slate-700 p-1 rounded-lg">
            <TabsTrigger value="units">
              <Grid3X3 className="mr-2 h-4 w-4" /> Units
            </TabsTrigger>

            <TabsTrigger value="groups" id="groups-tab-trigger">
              <Users className="mr-2 h-4 w-4" /> Groups
            </TabsTrigger>

            <TabsTrigger value="common-areas" id="common-areas-tab-trigger">
              <MapPinned className="mr-2 h-4 w-4" /> Common Areas
            </TabsTrigger>
          </TabsList>

          {/* ----------- UNITS ---------- */}
          <TabsContent value="units" className="mt-6">
            <ManageUnitsHeader
              onAddUnitClick={() => {
                setEditingUnit(null);
                setUnitFormData({ identifier: "", floor: "", label: "" });
                setIsFormDialogOpen(true);
              }}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />

            <Card className="dark:bg-slate-800 mt-4 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Unit Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <UnitList
                  units={filteredUnits}
                  onEditUnit={handleEditUnit}
                  onDeleteUnit={handleDeleteUnit}
                  loading={loadingUnits}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----------- GROUPS ----------- */}
          <TabsContent value="groups" className="mt-6">
            <ManageGroups buildingUnits={buildingUnits} />
          </TabsContent>

          {/* ----------- COMMON AREAS ----------- */}
          <TabsContent value="common-areas" className="mt-6">
            <ManageCommonAreas />
          </TabsContent>
        </Tabs>

        {/* Unit Dialog */}
        <UnitFormDialog
          isOpen={isFormDialogOpen}
          onOpenChange={(s) => {
            setIsFormDialogOpen(s);
            if (!s) setEditingUnit(null);
          }}
          unitData={unitFormData}
          onInputChange={handleFormInputChange}
          onSubmit={handleSubmitUnit}
          isEditing={!!editingUnit}
        />
      </motion.div>
    </Layout>
  );
};

export default ManageUnits;
