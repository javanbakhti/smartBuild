import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import ManageDoorsHeader from '@/components/manager/doors/ManageDoorsHeader';
    import DoorList from '@/components/manager/doors/DoorList';
    import DoorFormDialog from '@/components/manager/doors/DoorFormDialog';

    const predefinedDoors = [
      { name: "Main Entrance", location: "Building front" },
      { name: "Parking Garage Gate", location: "Underground parking" },
      { name: "Rooftop Access", location: "Top floor" },
      { name: "Service Entrance", location: "Building rear" },
      { name: "Gym Door", location: "Amenities floor" },
    ];

    const ManageDoors = () => {
      const { toast } = useToast();
      const [doors, setDoors] = useState([]);
      const [commonAreas, setCommonAreas] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
      const [editingDoor, setEditingDoor] = useState(null);
      
      const [doorFormData, setDoorFormData] = useState({
        name: '',
        location: '',
        status: 'Closed', // Default status
        predefinedSelection: ''
      });

      useEffect(() => {
        const storedDoors = JSON.parse(localStorage.getItem('doors')) || [];
        setDoors(storedDoors.map(door => ({ ...door, status: door.status || 'Closed' })));

        const managerData = JSON.parse(localStorage.getItem('user'));
        if (managerData && managerData.buildingUid) {
          const storedCommonAreas = JSON.parse(localStorage.getItem(`commonAreas_${managerData.buildingUid}`)) || [];
          setCommonAreas(storedCommonAreas);
        }
      }, []);

      const saveDoors = (updatedDoors) => {
        localStorage.setItem('doors', JSON.stringify(updatedDoors));
        setDoors(updatedDoors);
        const buildingDetails = JSON.parse(localStorage.getItem('buildingDetails')) || {};
        localStorage.setItem('buildingDetails', JSON.stringify({...buildingDetails, doorCount: updatedDoors.length}));
      };

      const resetForm = () => {
        setDoorFormData({ name: '', location: '', status: 'Closed', predefinedSelection: '' });
        setEditingDoor(null);
      };

      const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setDoorFormData(prev => ({ ...prev, [name]: value }));
      };
      
      const handleStatusChange = (doorId, newStatus) => {
        const updatedDoors = doors.map(door => 
          door.id === doorId ? { ...door, status: newStatus } : door
        );
        saveDoors(updatedDoors);
        toast({ title: "Door Status Updated", description: `Door status changed to ${newStatus}.` });
      };


      const handlePredefinedDoorSelectChange = (value) => {
        setDoorFormData(prev => {
          if (value === "custom_door" || !value) {
            return { ...prev, predefinedSelection: value, name: '', location: '', status: 'Closed' };
          }
          
          if (value.startsWith('ca-')) {
            const areaId = value.substring(3);
            const selectedArea = commonAreas.find(area => area.id === areaId);
            if (selectedArea) {
              let location = selectedArea.floorLocation || '';
              if (!location && selectedArea.description) {
                location = selectedArea.description.split('.')[0].substring(0, 60);
              }
              return { ...prev, predefinedSelection: value, name: selectedArea.name, location: location, status: 'Closed' };
            }
          }

          const selected = predefinedDoors.find(d => d.name === value);
          if (selected) {
            return { ...prev, predefinedSelection: value, name: selected.name, location: selected.location, status: 'Closed' };
          }
          return { ...prev, predefinedSelection: value, status: 'Closed' };
        });
      };

      const handleSubmitDoor = () => {
        const { name, location, status } = doorFormData;
        if (!name.trim()) {
          toast({ title: "Error", description: "Door name is required.", variant: "destructive" });
          return;
        }

        if (editingDoor) {
          const updatedDoors = doors.map(d => d.id === editingDoor.id ? { ...d, name, location, status } : d);
          saveDoors(updatedDoors);
          toast({ title: "Door Updated", description: `"${name}" has been updated.` });
        } else {
          const newDoor = {
            id: Date.now(),
            name,
            location,
            status,
            accessibleBy: [], 
            activityLog: [], 
          };
          saveDoors([...doors, newDoor]);
          toast({ title: "Door Added", description: `"${name}" has been added.` });
        }
        resetForm();
        setIsFormDialogOpen(false);
      };

      const handleEditDoor = (door) => {
        setEditingDoor(door);
        setDoorFormData({
          name: door.name,
          location: door.location || '',
          status: door.status || 'Closed',
          predefinedSelection: '' 
        });
        setIsFormDialogOpen(true);
      };

      const handleDeleteDoor = (doorId) => {
        if (window.confirm("Are you sure you want to remove this door? This action cannot be undone.")) {
          const updatedDoors = doors.filter(d => d.id !== doorId);
          saveDoors(updatedDoors);
          toast({ title: "Door Removed", description: "The door has been removed.", variant: "destructive" });
        }
      };

      const filteredDoors = doors.filter(door =>
        door.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (door.location && door.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        door.status.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <Layout role="manager">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <ManageDoorsHeader
              onAddDoorClick={() => { resetForm(); setIsFormDialogOpen(true); }}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
            
            <DoorList
              doors={filteredDoors}
              onEditDoor={handleEditDoor}
              onDeleteDoor={handleDeleteDoor}
              onStatusChange={handleStatusChange}
            />
            
            <DoorFormDialog
              isOpen={isFormDialogOpen}
              onOpenChange={(isOpen) => {
                setIsFormDialogOpen(isOpen);
                if (!isOpen) resetForm();
              }}
              doorData={doorFormData}
              onInputChange={handleFormInputChange}
              onPredefinedSelectChange={handlePredefinedDoorSelectChange}
              onSubmit={handleSubmitDoor}
              isEditing={!!editingDoor}
              predefinedDoors={predefinedDoors}
              commonAreas={commonAreas}
            />

          </motion.div>
        </Layout>
      );
    };

    export default ManageDoors;