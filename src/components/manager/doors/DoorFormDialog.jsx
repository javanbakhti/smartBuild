import React from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';

    const DoorFormDialog = ({ isOpen, onOpenChange, doorData, onInputChange, onPredefinedSelectChange, onSubmit, isEditing, predefinedDoors, commonAreas }) => {
      const { name = '', location = '', status = 'Closed', predefinedSelection = '' } = doorData;

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{isEditing ? 'Edit Door' : 'Add New Door'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the details for this door.' : 'Fill in the details to add a new door.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
              {!isEditing && (
                <div>
                  <Label htmlFor="predefinedSelection" className="dark:text-gray-300">Quick Add (Optional)</Label>
                  <Select value={predefinedSelection} onValueChange={onPredefinedSelectChange}>
                    <SelectTrigger id="predefinedSelection" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue placeholder="Select a predefined door..." />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white">
                      {commonAreas && commonAreas.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="dark:text-gray-400">From Common Areas</SelectLabel>
                          {commonAreas.map(area => (
                            <SelectItem key={`ca-${area.id}`} value={`ca-${area.id}`} className="dark:hover:bg-slate-700">{area.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      <SelectGroup>
                        <SelectLabel className="dark:text-gray-400">Standard Options</SelectLabel>
                        <SelectItem value="custom_door" className="dark:hover:bg-slate-700">Custom Door</SelectItem>
                        {predefinedDoors.map(door => (
                          <SelectItem key={door.name} value={door.name} className="dark:hover:bg-slate-700">{door.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="name" className="dark:text-gray-300">Door Name</Label>
                <Input id="name" name="name" value={name} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" required />
              </div>
              <div>
                <Label htmlFor="location" className="dark:text-gray-300">Location/Description (Optional)</Label>
                <Input id="location" name="location" value={location} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div>
                <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                <Select name="status" value={status} onValueChange={(value) => onInputChange({ target: { name: 'status', value }})}>
                    <SelectTrigger id="status" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white">
                        <SelectItem value="Open" className="dark:hover:bg-slate-700">Open</SelectItem>
                        <SelectItem value="Closed" className="dark:hover:bg-slate-700">Closed</SelectItem>
                        <SelectItem value="Reported" className="dark:hover:bg-slate-700">Reported</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{isEditing ? 'Save Changes' : 'Add Door'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default DoorFormDialog;