import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Checkbox } from '@/components/ui/checkbox';

    const ScheduleModal = ({ isOpen, onClose, onSave, schedule }) => {
      const [currentSchedule, setCurrentSchedule] = useState({ type: 'daily', time: '02:00', days: [], dayOfMonth: '1st' });

      useEffect(() => {
        if (schedule) {
          setCurrentSchedule(schedule);
        }
      }, [schedule, isOpen]);

      const handleSave = () => {
        onSave(currentSchedule);
        onClose();
      };

      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const daysOfMonth = ['1st', '15th', 'Last day of month'];

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{schedule?.id ? 'Edit' : 'Add New'} Backup Schedule</DialogTitle>
              <DialogDescription className="dark:text-gray-300">Configure the details for this automated backup schedule.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="scheduleType" className="dark:text-gray-300">Schedule Type</Label>
                <Select value={currentSchedule.type} onValueChange={value => setCurrentSchedule(s => ({...s, type: value}))}>
                  <SelectTrigger id="scheduleType" className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                    <SelectItem value="daily" className="dark:hover:bg-slate-700">Daily</SelectItem>
                    <SelectItem value="weekly" className="dark:hover:bg-slate-700">Weekly</SelectItem>
                    <SelectItem value="monthly" className="dark:hover:bg-slate-700">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduleTime" className="dark:text-gray-300">Time (HH:MM)</Label>
                <Input id="scheduleTime" type="time" value={currentSchedule.time} onChange={e => setCurrentSchedule(s => ({...s, time: e.target.value}))} className="dark:bg-slate-700 dark:text-white dark:border-slate-600"/>
              </div>
              {currentSchedule.type === 'weekly' && (
                <div>
                  <Label className="dark:text-gray-300">Days of Week</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day}`} 
                          checked={currentSchedule.days.includes(day)}
                          onCheckedChange={checked => {
                            setCurrentSchedule(s => ({
                              ...s, 
                              days: checked ? [...s.days, day] : s.days.filter(d => d !== day)
                            }));
                          }}
                        />
                        <Label htmlFor={`day-${day}`} className="dark:text-gray-300 font-normal">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentSchedule.type === 'monthly' && (
                <div>
                  <Label htmlFor="dayOfMonth" className="dark:text-gray-300">Day of Month</Label>
                  <Select value={currentSchedule.dayOfMonth} onValueChange={value => setCurrentSchedule(s => ({...s, dayOfMonth: value}))}>
                    <SelectTrigger id="dayOfMonth" className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue /></SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                      {daysOfMonth.map(day => <SelectItem key={day} value={day} className="dark:hover:bg-slate-700">{day}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ScheduleModal;