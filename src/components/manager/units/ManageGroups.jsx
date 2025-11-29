import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Checkbox } from "@/components/ui/checkbox";
    import { Users, PlusCircle, Edit3, Trash2, MoreHorizontal, Search, Users2, ShieldAlert } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { useSort } from '@/hooks/useSort';
    import SortableHeader from '@/components/shared/SortableHeader';

    const ManageGroups = ({ buildingUnits, residents, manager }) => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const [groups, setGroups] = useState([]);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingGroup, setEditingGroup] = useState(null);
      const [groupSearchTerm, setGroupSearchTerm] = useState('');
      const [groupFormData, setGroupFormData] = useState({ name: '', unitIds: [] });
      const [buildingUid, setBuildingUid] = useState(null);
      const [loading, setLoading] = useState(true);


      useEffect(() => {
        setLoading(true);
        if (manager && manager.buildingUid) {
          setBuildingUid(manager.buildingUid);
          const storedGroups = JSON.parse(localStorage.getItem(`unitGroups_${manager.buildingUid}`)) || [];
          setGroups(storedGroups.map(g => ({
              ...g,
              unitCount: g.unitIds.length,
              residentCount: residents.filter(r => g.unitIds.includes(r.unitNumber)).length
          })));
        } else {
           setBuildingUid(null); 
           setGroups([]); // Clear groups if no UID
        }
        setLoading(false);
      }, [manager, residents]);

      const saveGroups = (updatedGroups) => {
        if (buildingUid) {
          localStorage.setItem(`unitGroups_${buildingUid}`, JSON.stringify(updatedGroups));
          setGroups(updatedGroups.map(g => ({
              ...g,
              unitCount: g.unitIds.length,
              residentCount: residents.filter(r => g.unitIds.includes(r.unitNumber)).length
          })));
        } else {
          toast({ title: "Save Error", description: "Cannot save groups without a Building UID.", variant: "destructive" });
        }
      };

      const resetGroupForm = () => {
        setGroupFormData({ name: '', unitIds: [] });
        setEditingGroup(null);
      };

      const handleGroupFormInputChange = (e) => {
        const { name, value } = e.target;
        setGroupFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleUnitSelectionChange = (unitId) => {
        setGroupFormData(prev => {
          const newUnitIds = prev.unitIds.includes(unitId)
            ? prev.unitIds.filter(id => id !== unitId)
            : [...prev.unitIds, unitId];
          return { ...prev, unitIds: newUnitIds };
        });
      };

      const handleSubmitGroup = () => {
        if (!buildingUid) {
          toast({ title: "Error", description: "Building UID is missing. Cannot create/update group.", variant: "destructive" });
          return;
        }
        if (!groupFormData.name.trim()) {
          toast({ title: "Error", description: "Group name is required.", variant: "destructive" });
          return;
        }

        if (editingGroup) {
          const updatedGroups = groups.map(g => g.id === editingGroup.id ? { ...editingGroup, ...groupFormData } : g);
          saveGroups(updatedGroups);
          toast({ title: "Group Updated", description: `Group "${groupFormData.name}" updated.` });
        } else {
          if (groups.some(g => g.name.toLowerCase() === groupFormData.name.toLowerCase())) {
            toast({ title: "Error", description: `A group named "${groupFormData.name}" already exists.`, variant: "destructive" });
            return;
          }
          const newGroup = {
            id: Date.now().toString(),
            ...groupFormData
          };
          saveGroups([...groups, newGroup]);
          toast({ title: "Group Created", description: `Group "${groupFormData.name}" created.` });
        }
        resetGroupForm();
        setIsFormOpen(false);
      };

      const handleEditGroup = (group) => {
        setEditingGroup(group);
        setGroupFormData({ name: group.name, unitIds: group.unitIds || [] });
        setIsFormOpen(true);
      };

      const handleDeleteGroup = (groupId) => {
        if (!buildingUid) {
          toast({ title: "Error", description: "Building UID is missing. Cannot delete group.", variant: "destructive" });
          return;
        }
        if (window.confirm("Are you sure you want to delete this group?")) {
          const groupToDelete = groups.find(g => g.id === groupId);
          saveGroups(groups.filter(g => g.id !== groupId));
          toast({ title: "Group Deleted", description: `Group "${groupToDelete?.name}" deleted.`, variant: "destructive" });
        }
      };
      
      const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
      );
      
      const { items: sortedGroups, requestSort, sortConfig } = useSort(filteredGroups);

      if (loading) {
        return <div className="text-center p-4">Loading group data...</div>;
      }

      if (!buildingUid) { 
        return (
            <Card className="bg-orange-50 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700">
                <CardHeader className="flex flex-row items-center space-x-3">
                  <ShieldAlert className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  <div>
                    <CardTitle className="text-orange-700 dark:text-orange-300">Building UID Missing</CardTitle>
                    <CardDescription className="text-orange-600 dark:text-orange-400">
                        Cannot manage groups without a Building UID. Ensure the manager is properly logged in and building setup is complete.
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
                <CardTitle className="dark:text-white flex items-center"><Users2 className="mr-2 h-5 w-5 text-primary"/>Unit Groups</CardTitle>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search groups..." 
                      value={groupSearchTerm}
                      onChange={(e) => setGroupSearchTerm(e.target.value)}
                      className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                  <Button onClick={() => { resetGroupForm(); setIsFormOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Group
                  </Button>
                </div>
              </div>
              <CardDescription>Create and manage custom groups of units for targeted messaging and actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-slate-700">
                      <TableHead className="dark:text-gray-300">
                        <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>
                            Group Name
                        </SortableHeader>
                      </TableHead>
                      <TableHead className="dark:text-gray-300">
                        <SortableHeader columnKey="unitCount" sortConfig={sortConfig} requestSort={requestSort}>
                            Units in Group
                        </SortableHeader>
                      </TableHead>
                      <TableHead className="dark:text-gray-300">
                        <SortableHeader columnKey="residentCount" sortConfig={sortConfig} requestSort={requestSort}>
                            Resident Count
                        </SortableHeader>
                      </TableHead>
                      <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedGroups.length > 0 ? sortedGroups.map((group) => (
                      <TableRow key={group.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-medium dark:text-white">{group.name}</TableCell>
                        <TableCell className="dark:text-gray-300 text-sm" title={group.unitIds.join(', ')}>
                          {group.unitCount} ({group.unitIds.slice(0,5).join(', ')}{group.unitIds.length > 5 ? '...' : ''})
                        </TableCell>
                        <TableCell className="dark:text-gray-300 text-sm">{group.residentCount}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-slate-700">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                              <DropdownMenuLabel className="dark:text-gray-300">Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditGroup(group)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                                <Edit3 className="mr-2 h-4 w-4" /> Edit Group
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="dark:bg-slate-700" />
                              <DropdownMenuItem onClick={() => handleDeleteGroup(group.id)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:text-red-600 dark:focus:text-red-400">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Group
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center dark:text-gray-300">
                          No groups created yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) resetGroupForm(); }}>
            <DialogContent className="sm:max-w-lg dark:bg-slate-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
                <DialogDescription>
                  {editingGroup ? 'Update group details and unit assignments.' : 'Define a new group and select units to include.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="groupName" className="dark:text-gray-300">Group Name</Label>
                  <Input id="groupName" name="name" value={groupFormData.name} onChange={handleGroupFormInputChange} placeholder="e.g., Tenants, Floor 1 VIPs" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Assign Units to Group</Label>
                  <div className="max-h-60 overflow-y-auto p-2 border rounded-md dark:border-slate-600 space-y-1">
                    {buildingUnits.length > 0 ? buildingUnits.map(unit => (
                      <div key={unit.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50 dark:hover:bg-slate-700/50">
                        <Checkbox
                          id={`unit-${unit.id}`}
                          checked={groupFormData.unitIds.includes(unit.identifier)}
                          onCheckedChange={() => handleUnitSelectionChange(unit.identifier)}
                          className="dark:border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={`unit-${unit.id}`} className="text-sm font-normal dark:text-gray-300 cursor-pointer">
                          {unit.identifier} ({unit.label || 'No Label'}) - Floor {unit.floor}
                        </Label>
                      </div>
                    )) : <p className="text-sm text-muted-foreground p-2">No units available to assign. Please add units first.</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSubmitGroup} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default ManageGroups;