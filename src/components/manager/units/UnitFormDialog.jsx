import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Save } from 'lucide-react';

const UnitFormDialog = ({ isOpen, onOpenChange, unitData, onInputChange, onSubmit, isEditing }) => {
  const { identifier = '', floor = '', label = '' } = unitData;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">{isEditing ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="unitFloor" className="dark:text-gray-300">Floor Number</Label>
            <Input 
              id="unitFloor" 
              name="floor" 
              type="number" 
              min="0" 
              value={floor} 
              onChange={onInputChange} 
              placeholder="e.g., 1, 2, ..." 
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600" 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unitIdentifier" className="dark:text-gray-300">Unit Identifier</Label>
            <Input 
              id="unitIdentifier" 
              name="identifier" 
              value={identifier} 
              onChange={onInputChange} 
              placeholder="e.g., A, 101, P1" 
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600" 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unitLabel" className="dark:text-gray-300">Custom Label (Optional)</Label>
            <Input 
              id="unitLabel" 
              name="label" 
              value={label} 
              onChange={onInputChange} 
              placeholder="e.g., Penthouse Suite, Lobby Office" 
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Save Changes' : 'Add Unit'}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnitFormDialog;