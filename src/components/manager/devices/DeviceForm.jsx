import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { DEVICE_MODELS } from './deviceUtils';
    import ErrorBoundary from '@/components/ErrorBoundary';

    const INITIAL_STATE = {
      serialNumber: '',
      modelId: '',
      macAddress: '',
      relayAssignments: {},
    };

    const DeviceFormContent = ({ isOpen, onOpenChange, onSubmit, initialData, editingDevice, doors, devices }) => {
      const [formData, setFormData] = useState(INITIAL_STATE);
      
      useEffect(() => {
        if (isOpen) {
          setFormData(initialData || INITIAL_STATE);
        }
      }, [isOpen, initialData]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleModelChange = (modelId) => {
        setFormData(prev => ({
          ...prev,
          modelId,
          relayAssignments: {}, // Reset assignments when model changes
        }));
      };

      const handleRelayAssignmentChange = (relayIndex, doorId) => {
        setFormData(prev => ({
          ...prev,
          relayAssignments: {
            ...prev.relayAssignments,
            [`relay_${relayIndex + 1}`]: doorId === 'none' ? '' : doorId,
          },
        }));
      };

      const handleSubmit = () => {
        if (onSubmit(formData)) {
          onOpenChange(false);
          setFormData(INITIAL_STATE);
        }
      };

      const handleDialogClose = (open) => {
        if (!open) {
          setFormData(INITIAL_STATE);
        }
        onOpenChange(open);
      };
      
      const selectedModel = formData.modelId ? DEVICE_MODELS.find(m => m.id === formData.modelId) : null;
      const canRenderRelays = !!selectedModel && typeof selectedModel.relays === 'number' && selectedModel.relays > 0;

      return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-lg dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{editingDevice ? 'Edit Device' : 'Add New Device'}</DialogTitle>
              <DialogDescription>
                {editingDevice ? 'Update device details and relay assignments.' : 'Register a new intercom device and assign its relays to doors.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <Label htmlFor="modelId" className="dark:text-gray-300">Device Model</Label>
                <Select onValueChange={handleModelChange} value={formData.modelId || ''} disabled={!!editingDevice}>
                  <SelectTrigger id="modelId" className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <SelectValue placeholder="Select device model..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                    {DEVICE_MODELS.map(model => (
                      <SelectItem key={model.id} value={model.id} className="dark:hover:bg-slate-700 flex items-center">
                        <div className="flex items-center">
                          {model.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="serialNumber" className="dark:text-gray-300">Serial Number</Label>
                <Input id="serialNumber" name="serialNumber" value={formData.serialNumber || ''} onChange={handleInputChange} placeholder="Enter device serial number" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" disabled={!!editingDevice} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="macAddress" className="dark:text-gray-300">MAC Address</Label>
                <Input id="macAddress" name="macAddress" value={formData.macAddress || ''} onChange={handleInputChange} placeholder="e.g., 00:1B:44:11:3A:B7" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              
              {canRenderRelays && (
                <div id="relay-assignment-section" className="space-y-3 pt-2 mt-2 border-t dark:border-slate-700">
                  <h4 className="text-sm font-medium dark:text-gray-300">Relay Assignments ({selectedModel.name}):</h4>
                  {Array.from({ length: selectedModel.relays }).map((_, index) => {
                    const relayKey = `relay_${index + 1}`;
                    const currentAssignment = formData.relayAssignments?.[relayKey] || 'none';

                    return (
                      <div key={index} className="space-y-1">
                        <Label htmlFor={relayKey} className="dark:text-gray-400 text-xs">Relay {index + 1}</Label>
                        <Select
                          onValueChange={(doorId) => handleRelayAssignmentChange(index, doorId)}
                          value={currentAssignment}
                        >
                          <SelectTrigger id={relayKey} className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                            <SelectValue placeholder="Assign a door..." />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                            <SelectItem value="none" className="dark:hover:bg-slate-700 italic">None</SelectItem>
                            {doors.map(door => (
                              <SelectItem key={door.id} value={door.id.toString()} className="dark:hover:bg-slate-700">
                                {door.name} ({door.location || 'No location'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingDevice ? 'Save Changes' : 'Add Device'}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    const DeviceForm = (props) => {
      const [key, setKey] = useState(Date.now());
      const handleReset = () => setKey(Date.now());

      return (
        <ErrorBoundary key={key} onReset={handleReset}>
          <DeviceFormContent {...props} />
        </ErrorBoundary>
      )
    }

    export default DeviceForm;