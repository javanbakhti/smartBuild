import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { HardDrive, PlusCircle, Search, ShieldAlert } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { useTour } from '@/contexts/TourContext';
    import DeviceForm from '@/components/manager/devices/DeviceForm';
    import DeviceTable from '@/components/manager/devices/DeviceTable';
    import { DEVICE_MODELS } from '@/components/manager/devices/deviceUtils';
    import ErrorBoundary from '@/components/ErrorBoundary';

    const manageDevicesTourSteps = [
      {
        id: 'md-welcome',
        title: 'Manage Devices',
        description: 'Here you can register and configure your intercom devices, such as kiosks and keypads.',
        targetId: null,
        placement: 'center',
      },
      {
        id: 'md-add-device-button',
        title: 'Add New Device',
        description: 'Click this button to register a new hardware device with the system.',
        targetId: 'add-new-device-button',
        placement: 'bottom',
      },
      {
        id: 'md-device-list',
        title: 'Device List',
        description: 'All registered devices are listed here. You can see their serial number, model, and assigned doors. Double-click a row to edit it.',
        targetId: 'device-list-card', 
        placement: 'top',
      },
      {
        id: 'md-device-actions',
        title: 'Device Actions',
        description: 'Use the actions menu (three dots) or inline buttons to edit or remove a device.',
        targetId: 'device-actions-dropdown-trigger',
        placement: 'left',
      },
      {
        id: 'md-device-form-serial',
        title: 'Device Serial Number',
        description: 'When adding or editing, enter the unique serial number found on the device. This is crucial for identification.',
        targetId: 'serialNumber',
        placement: 'bottom',
        isModalElement: true,
      },
      {
        id: 'md-device-form-model',
        title: 'Device Model',
        description: 'Select the correct model for your device. This determines its capabilities, like the number of relays it has.',
        targetId: 'modelId',
        placement: 'bottom',
        isModalElement: true,
      },
      {
        id: 'md-device-form-relays',
        title: 'Assign Doors',
        description: 'Based on the model, assign specific doors to each relay on the device, or leave it as "None".',
        targetId: 'relay-assignment-section',
        placement: 'top',
        isModalElement: true,
      },
    ];

    const INITIAL_FORM_STATE = {
      serialNumber: '',
      modelId: '',
      macAddress: '',
      relayAssignments: {},
    };

    const ManageDevicesContent = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const { startTour } = useTour();
      const [devices, setDevices] = useState([]);
      const [doors, setDoors] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingDevice, setEditingDevice] = useState(null);
      const [manager, setManager] = useState(null);
      const [loading, setLoading] = useState(true);
      const [formData, setFormData] = useState(INITIAL_FORM_STATE);

      const [sortConfig, setSortConfig] = useState({ key: 'modelId', direction: 'ascending' });

      useEffect(() => {
        startTour('manageDevices', manageDevicesTourSteps);
      }, [startTour]);
      
      useEffect(() => {
        const currentManagerString = localStorage.getItem('user');
        let buildingUidToUse = null;
        if (currentManagerString) {
          try {
            const currentManager = JSON.parse(currentManagerString);
            setManager(currentManager);
            if (currentManager && currentManager.buildingUid) {
              buildingUidToUse = currentManager.buildingUid;
            }
          } catch(e) {
            console.error("Failed to parse manager data from localStorage for devices", e);
            setManager(null);
          }
        } else {
          setManager(null);
        }

        if (buildingUidToUse) {
          const storedDevices = JSON.parse(localStorage.getItem(`buildingDevices_${buildingUidToUse}`)) || [];
          setDevices(storedDevices);
        } else {
          setDevices([]);
        }
        
        const storedDoors = JSON.parse(localStorage.getItem('doors')) || [];
        setDoors(storedDoors);
        setLoading(false);
      }, []);

      const saveDevices = (updatedDevices) => {
        if (manager && manager.buildingUid) {
          localStorage.setItem(`buildingDevices_${manager.buildingUid}`, JSON.stringify(updatedDevices));
          setDevices(updatedDevices);
        } else {
          toast({ title: "Save Error", description: "Cannot save device data. Manager or Building UID missing.", variant: "destructive" });
        }
      };

      const handleOpenFormForNew = () => {
        setEditingDevice(null);
        setFormData(INITIAL_FORM_STATE);
        setIsFormOpen(true);
      };

      const handleOpenFormForEdit = (device) => {
        setEditingDevice(device);
        setFormData({ ...device });
        setIsFormOpen(true);
      };

      const handleSubmitDevice = (currentFormData) => {
        if (!currentFormData.serialNumber.trim() || !currentFormData.modelId) {
          toast({ title: "Validation Error", description: "Serial Number and Device Model are required.", variant: "destructive" });
          return false;
        }
        
        const selectedModel = DEVICE_MODELS.find(m => m.id === currentFormData.modelId);
        if (!selectedModel) {
            toast({ title: "Validation Error", description: "Invalid device model selected.", variant: "destructive" });
            return false;
        }

        if (editingDevice) {
          const updatedDevices = devices.map(d => d.id === editingDevice.id ? { ...editingDevice, ...currentFormData } : d);
          saveDevices(updatedDevices);
          toast({ title: "Device Updated", description: `Device ${currentFormData.serialNumber} updated.` });
        } else {
          if (devices.some(d => d.serialNumber === currentFormData.serialNumber)) {
            toast({ title: "Duplicate Error", description: "A device with this serial number already exists.", variant: "destructive" });
            return false;
          }
          const newDevice = {
            id: Date.now(),
            ...currentFormData,
            dateAdded: new Date().toISOString(),
          };
          saveDevices([...devices, newDevice]);
          toast({ title: "Device Added", description: `Device ${currentFormData.serialNumber} added.` });
        }
        return true;
      };

      const handleDeleteDevice = (deviceId) => {
        if (window.confirm("Are you sure you want to remove this device?")) {
          const deviceToRemove = devices.find(d => d.id === deviceId);
          saveDevices(devices.filter(d => d.id !== deviceId));
          toast({ title: "Device Removed", description: `Device ${deviceToRemove?.serialNumber} removed.`, variant: "destructive" });
        }
      };
      
      const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };

      if (loading) {
        return <div className="text-center p-8">Loading device data...</div>;
      }
      if (!manager || !manager.buildingUid) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400">Building UID Missing</h2>
            <p className="text-muted-foreground mt-2">
              A Building Unique Identifier (UID) is required to manage devices. 
              Please ensure the building setup is complete and you are logged in correctly.
            </p>
            <Button onClick={() => navigate('/manager/building-setup')} className="mt-6">Go to Building Setup</Button>
          </div>
        );
      }

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                <HardDrive className="mr-3 h-8 w-8 text-primary" /> Manage Devices
              </h1>
              <p className="text-muted-foreground">Configure and assign intercom devices to doors.</p>
            </div>
            <Button id="add-new-device-button" onClick={handleOpenFormForNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Device
            </Button>
          </div>

          <Card id="device-list-card" className="dark:bg-slate-800 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <CardTitle className="dark:text-white">Device List</CardTitle>
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search by model, serial, MAC..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DeviceTable
                devices={devices} 
                doors={doors}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                requestSort={requestSort}
                onEditDevice={handleOpenFormForEdit}
                onDeleteDevice={handleDeleteDevice}
              />
            </CardContent>
          </Card>

          <DeviceForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleSubmitDevice}
            initialData={formData}
            editingDevice={editingDevice}
            doors={doors}
            devices={devices} 
          />
        </motion.div>
      );
    };
    
    const ManageDevices = () => {
      const [key, setKey] = useState(Date.now());
      const handleReset = useCallback(() => {
        setKey(Date.now());
      }, []);

      const userStr = localStorage.getItem('user');
      const role = userStr ? JSON.parse(userStr).role : 'manager';

      return (
        <Layout role={role}>
            <ErrorBoundary key={key} onReset={handleReset}>
                <ManageDevicesContent />
            </ErrorBoundary>
        </Layout>
      );
    }

    export default ManageDevices;