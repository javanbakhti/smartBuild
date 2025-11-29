import React, { useState, useEffect, useMemo } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { PlusCircle, Search, MapPinned, ShieldAlert } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import CommonAreaTable from './CommonAreaTable';
    import CommonAreaFormDialog from './CommonAreaFormDialog';

    const defaultAreaFormData = {
      name: '',
      floorLocation: '',
      description: '',
      assignedDevice: '',
      accessType: 'shared', 
    };

    const ManageCommonAreas = ({ manager }) => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const [commonAreas, setCommonAreas] = useState([]);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingArea, setEditingArea] = useState(null);
      const [areaSearchTerm, setAreaSearchTerm] = useState('');
      const [areaFormData, setAreaFormData] = useState(defaultAreaFormData);
      const [buildingUid, setBuildingUid] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        setLoading(true);
        if (manager && manager.buildingUid) {
          setBuildingUid(manager.buildingUid);
          const storedAreas = JSON.parse(localStorage.getItem(`commonAreas_${manager.buildingUid}`)) || [];
          setCommonAreas(storedAreas);
        } else {
          setBuildingUid(null);
          setCommonAreas([]);
        }
        setLoading(false);
      }, [manager]);

      const saveCommonAreas = (updatedAreas) => {
        if (buildingUid) {
          localStorage.setItem(`commonAreas_${buildingUid}`, JSON.stringify(updatedAreas));
          setCommonAreas(updatedAreas);
        } else {
          toast({ title: "Save Error", description: "Cannot save common areas without a Building UID.", variant: "destructive" });
        }
      };

      const resetAreaForm = () => {
        setAreaFormData(defaultAreaFormData);
        setEditingArea(null);
      };

      const handleAreaFormInputChange = (e) => {
        const { name, value } = e.target;
        setAreaFormData(prev => ({ ...prev, [name]: value }));
      };
      
      const handleAccessTypeChange = (value) => {
        setAreaFormData(prev => ({ ...prev, accessType: value }));
      };

      const handleSubmitArea = () => {
        if (!buildingUid) {
          toast({ title: "Error", description: "Building UID is missing. Cannot create/update common area.", variant: "destructive" });
          return;
        }
        if (!areaFormData.name.trim()) {
          toast({ title: "Error", description: "Area name is required.", variant: "destructive" });
          return;
        }

        if (editingArea) {
          const updatedAreas = commonAreas.map(area => area.id === editingArea.id ? { ...editingArea, ...areaFormData } : area);
          saveCommonAreas(updatedAreas);
          toast({ title: "Common Area Updated", description: `Area "${areaFormData.name}" updated.` });
        } else {
          if (commonAreas.some(area => area.name.toLowerCase() === areaFormData.name.toLowerCase())) {
            toast({ title: "Error", description: `A common area named "${areaFormData.name}" already exists.`, variant: "destructive" });
            return;
          }
          const newArea = {
            id: Date.now().toString(),
            ...areaFormData,
            bookings: [] 
          };
          saveCommonAreas([...commonAreas, newArea]);
          toast({ title: "Common Area Created", description: `Area "${areaFormData.name}" created.` });
        }
        resetAreaForm();
        setIsFormOpen(false);
      };

      const handleEditArea = (area) => {
        setEditingArea(area);
        setAreaFormData({ 
          name: area.name, 
          floorLocation: area.floorLocation || '',
          description: area.description || '',
          assignedDevice: area.assignedDevice || '',
          accessType: area.accessType || 'shared'
        });
        setIsFormOpen(true);
      };

      const handleDeleteArea = (areaId) => {
        if (!buildingUid) {
          toast({ title: "Error", description: "Building UID is missing. Cannot delete common area.", variant: "destructive" });
          return;
        }
        if (window.confirm("Are you sure you want to delete this common area?")) {
          const areaToDelete = commonAreas.find(area => area.id === areaId);
          saveCommonAreas(commonAreas.filter(area => area.id !== areaId));
          toast({ title: "Common Area Deleted", description: `Area "${areaToDelete?.name}" deleted.`, variant: "destructive" });
        }
      };
      
      const handleViewSchedule = (areaId) => {
        toast({ title: "View Schedule", description: "Detailed schedule view coming soon!", duration: 3000 });
      };

      const filteredCommonAreas = commonAreas.filter(area =>
        area.name.toLowerCase().includes(areaSearchTerm.toLowerCase()) ||
        (area.floorLocation && area.floorLocation.toLowerCase().includes(areaSearchTerm.toLowerCase())) ||
        (area.accessType && area.accessType.toLowerCase().includes(areaSearchTerm.toLowerCase()))
      );

      if (loading) {
        return <div className="text-center p-4">Loading common area data...</div>;
      }

      if (!buildingUid) {
        return (
            <Card className="bg-orange-50 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700">
                <CardHeader className="flex flex-row items-center space-x-3">
                  <ShieldAlert className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  <div>
                    <CardTitle className="text-orange-700 dark:text-orange-300">Building UID Missing</CardTitle>
                    <CardDescription className="text-orange-600 dark:text-orange-400">
                        Cannot manage common areas without a Building UID. Ensure the manager is properly logged in and building setup is complete.
                    </CardDescription>
                  </div>
                </CardHeader>
                 <CardContent>
                  <Button onClick={() => navigate('/manager/building-setup')} className="bg-orange-500 hover:bg-orange-600 text-white">Go to Building Setup</Button>
                </CardContent>
            </Card>
        );
      }

      return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
          <Card className="dark:bg-slate-800/50">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <CardTitle className="dark:text-white flex items-center"><MapPinned className="mr-2 h-5 w-5 text-primary"/>Common Areas</CardTitle>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search common areas..." 
                      value={areaSearchTerm}
                      onChange={(e) => setAreaSearchTerm(e.target.value)}
                      className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <Button onClick={() => { resetAreaForm(); setIsFormOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Common Area
                  </Button>
                </div>
              </div>
              <CardDescription>Define and manage shared building facilities like gyms, pools, and parking.</CardDescription>
            </CardHeader>
            <CardContent>
              <CommonAreaTable 
                commonAreas={filteredCommonAreas}
                onEditArea={handleEditArea}
                onDeleteArea={handleDeleteArea}
                onViewSchedule={handleViewSchedule}
              />
            </CardContent>
          </Card>

          <CommonAreaFormDialog
            isOpen={isFormOpen}
            onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) resetAreaForm(); }}
            formData={areaFormData}
            onInputChange={handleAreaFormInputChange}
            onAccessTypeChange={handleAccessTypeChange}
            onSubmit={handleSubmitArea}
            isEditing={!!editingArea}
          />
        </motion.div>
      );
    };

    export default ManageCommonAreas;