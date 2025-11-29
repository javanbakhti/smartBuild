import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Switch } from '@/components/ui/switch';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
    import { Settings, CalendarClock, PlusCircle, Trash2, Info, Eye, EyeOff } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { format } from 'date-fns';
    import ScheduleModal from './ScheduleModal';

    const BackupOptions = ({ settings, setSettings }) => {
      const { toast } = useToast();
      const [showPassphrase, setShowPassphrase] = useState(false);
      const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
      const [currentSchedule, setCurrentSchedule] = useState(null);
      const [editingScheduleId, setEditingScheduleId] = useState(null);

      const handleInputChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      };

      const handleCreateManualBackup = () => {
        const newBackup = {
          id: `backup-${Date.now()}`,
          name: `ManualBackup-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`,
          date: new Date().toISOString(),
          type: 'Full', 
          size: `${(Math.random() * 10 + 1).toFixed(2)} MB`,
          encrypted: settings.encryptionEnabled 
        };
        const existingBackups = JSON.parse(localStorage.getItem('systemBackups')) || [];
        localStorage.setItem('systemBackups', JSON.stringify([newBackup, ...existingBackups]));
        toast({ title: 'Manual Backup Created', description: `Successfully created ${newBackup.name}.` });
      };

      const openScheduleModal = (schedule = null) => {
        if (schedule) {
          setCurrentSchedule(schedule);
          setEditingScheduleId(schedule.id);
        } else {
          setCurrentSchedule({ id: `schedule-${Date.now()}`, type: 'daily', time: '02:00', days: [], dayOfMonth: '1st' });
          setEditingScheduleId(null);
        }
        setIsScheduleModalOpen(true);
      };

      const handleSaveSchedule = (scheduleToSave) => {
        setSettings(prev => {
          const newSchedules = editingScheduleId 
            ? prev.schedules.map(s => s.id === editingScheduleId ? scheduleToSave : s)
            : [...prev.schedules, scheduleToSave];
          return {...prev, schedules: newSchedules};
        });
        setIsScheduleModalOpen(false);
        setEditingScheduleId(null);
      };

      const handleDeleteSchedule = (scheduleId) => {
        setSettings(prev => ({
          ...prev,
          schedules: prev.schedules.filter(s => s.id !== scheduleId)
        }));
      };

      const renderScheduleItem = (schedule) => {
        let summary = `${schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)} at ${schedule.time}`;
        if (schedule.type === 'weekly' && schedule.days.length > 0) {
          summary += ` on ${schedule.days.join(', ')}`;
        } else if (schedule.type === 'monthly') {
          summary += ` on the ${schedule.dayOfMonth}`;
        }
        return summary;
      };

      return (
        <>
          <Card className="dark:bg-slate-800 shadow-lg">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center"><Settings className="mr-2 h-5 w-5"/>Backup Options</CardTitle>
              <CardDescription>Configure manual and automated backup settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleCreateManualBackup} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Manual Backup
              </Button>
              
              <div className="space-y-2 border-t dark:border-slate-700 pt-4">
                <Label htmlFor="autoBackupToggle" className="flex items-center justify-between dark:text-gray-300">
                  <span>Enable Auto-Backup</span>
                  <Switch id="autoBackupToggle" checked={settings.autoBackupEnabled} onCheckedChange={value => handleInputChange('autoBackupEnabled', value)} />
                </Label>
                <p className="text-xs text-muted-foreground">Automatically back up your system based on the schedule(s) below.</p>
              </div>

              {settings.autoBackupEnabled && (
                <div className="space-y-4 border-t dark:border-slate-700 pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="dark:text-gray-300 flex items-center"><CalendarClock className="mr-2 h-4 w-4"/>Backup Schedules</Label>
                    <Button variant="outline" size="sm" onClick={() => openScheduleModal()} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
                    </Button>
                  </div>
                  {settings.schedules.length === 0 && <p className="text-xs text-muted-foreground">No schedules added yet.</p>}
                  <ul className="space-y-2">
                    {settings.schedules.map(schedule => (
                      <li key={schedule.id} className="flex items-center justify-between p-2 bg-muted/50 dark:bg-slate-700/50 rounded-md">
                        <span className="text-sm dark:text-gray-300">{renderScheduleItem(schedule)}</span>
                        <div>
                          <Button variant="ghost" size="icon" onClick={() => openScheduleModal(schedule)} className="mr-1 h-7 w-7 dark:text-gray-300 dark:hover:bg-slate-600">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(schedule.id)} className="h-7 w-7 text-destructive dark:text-red-500 dark:hover:bg-red-900/50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4 border-t dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="retentionPolicyEnabled" className="dark:text-gray-300 flex items-center">
                    Enable Retention Policy
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="ml-1 h-3 w-3 cursor-help" /></TooltipTrigger>
                      <TooltipContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600"><p>Automatically delete old backups.</p></TooltipContent>
                    </Tooltip>
                  </Label>
                  <Switch id="retentionPolicyEnabled" checked={settings.retentionPolicyEnabled} onCheckedChange={value => handleInputChange('retentionPolicyEnabled', value)} />
                </div>
                {settings.retentionPolicyEnabled && (
                  <div className="space-y-2">
                    <Select value={settings.retentionType} onValueChange={value => handleInputChange('retentionType', value)}>
                      <SelectTrigger className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select retention type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        <SelectItem value="latestX" className="dark:hover:bg-slate-700">Keep latest X backups</SelectItem>
                        <SelectItem value="olderThanX" className="dark:hover:bg-slate-700">Delete backups older than X days</SelectItem>
                      </SelectContent>
                    </Select>
                    {settings.retentionType === 'latestX' && (
                      <Select value={String(settings.retentionValue)} onValueChange={value => handleInputChange('retentionValue', parseInt(value))}>
                        <SelectTrigger className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                          <SelectValue placeholder="Number of backups" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                          {[3, 5, 10, 20, 30].map(num => <SelectItem key={num} value={String(num)} className="dark:hover:bg-slate-700">{num} backups</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {settings.retentionType === 'olderThanX' && (
                      <Select value={String(settings.retentionValue)} onValueChange={value => handleInputChange('retentionValue', parseInt(value))}>
                        <SelectTrigger className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                          <SelectValue placeholder="Days" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                          {[7, 14, 30, 90].map(days => <SelectItem key={days} value={String(days)} className="dark:hover:bg-slate-700">{days} days</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-xs text-muted-foreground">Older backups beyond the selected limit will be automatically deleted.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t dark:border-slate-700 pt-4">
                 <div className="flex items-center justify-between">
                  <Label htmlFor="encryptionEnabled" className="dark:text-gray-300 flex items-center">
                    Enable Backup Encryption
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="ml-1 h-3 w-3 cursor-help" /></TooltipTrigger>
                      <TooltipContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600"><p>Secure your backups with a passphrase.</p></TooltipContent>
                    </Tooltip>
                  </Label>
                  <Switch id="encryptionEnabled" checked={settings.encryptionEnabled} onCheckedChange={value => handleInputChange('encryptionEnabled', value)} />
                </div>
                {settings.encryptionEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="encryptionPassphrase" className="dark:text-gray-300">Encryption Passphrase</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="encryptionPassphrase" 
                        type={showPassphrase ? 'text' : 'password'} 
                        value={settings.encryptionPassphrase}
                        onChange={e => handleInputChange('encryptionPassphrase', e.target.value)}
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      />
                      <Button variant="ghost" size="icon" onClick={() => setShowPassphrase(!showPassphrase)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                        {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Encrypted backups will require this passphrase for restoration. Do not lose it.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <ScheduleModal 
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            onSave={handleSaveSchedule}
            schedule={currentSchedule}
          />
        </>
      );
    };

    export default BackupOptions;