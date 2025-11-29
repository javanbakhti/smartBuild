import React from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Save } from 'lucide-react';

    const CommonAreaFormDialog = ({ isOpen, onOpenChange, formData, onInputChange, onAccessTypeChange, onSubmit, isEditing }) => {
      const { name = '', floorLocation = '', description = '', assignedDevice = '', accessType = 'shared' } = formData;

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-lg dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{isEditing ? 'Edit Common Area' : 'Add New Common Area'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the details for this common area.' : 'Define a new shared facility for your building.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <Label htmlFor="areaName" className="dark:text-gray-300">Area Name <span className="text-red-500">*</span></Label>
                <Input id="areaName" name="name" value={name} onChange={onInputChange} placeholder="e.g., Pool, Gym, Rooftop Terrace" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="floorLocation" className="dark:text-gray-300">Floor or Location</Label>
                <Input id="floorLocation" name="floorLocation" value={floorLocation} onChange={onInputChange} placeholder="e.g., Ground Floor, Level P2, Near Lobby" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description" className="dark:text-gray-300">Description (Optional)</Label>
                <Textarea id="description" name="description" value={description} onChange={onInputChange} placeholder="Brief description of the area and its amenities." className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="assignedDevice" className="dark:text-gray-300">Access Control Device (Optional)</Label>
                <Input id="assignedDevice" name="assignedDevice" value={assignedDevice} onChange={onInputChange} placeholder="e.g., Door Controller ID, Smart Lock Name" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="accessType" className="dark:text-gray-300">Access Type</Label>
                <Select name="accessType" value={accessType} onValueChange={onAccessTypeChange}>
                    <SelectTrigger id="accessType" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select access type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white">
                        <SelectItem value="shared" className="dark:hover:bg-slate-700">Shared Use</SelectItem>
                        <SelectItem value="private" className="dark:hover:bg-slate-700">Private Use Only</SelectItem>
                        <SelectItem value="both" className="dark:hover:bg-slate-700">Both (Private & Shared)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Save Changes' : 'Add Area'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default CommonAreaFormDialog;