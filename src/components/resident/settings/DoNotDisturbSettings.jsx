import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Switch } from '@/components/ui/switch';
    import { BellOff } from 'lucide-react';

    const DoNotDisturbSettings = ({
      dndEnabled, setDndEnabled,
      dndScheduleActive, setDndScheduleActive,
      dndWorkHoursStart1, setDndWorkHoursStart1,
      dndWorkHoursEnd1, setDndWorkHoursEnd1,
      dndWorkHoursStart2, setDndWorkHoursStart2,
      dndWorkHoursEnd2, setDndWorkHoursEnd2,
      dndNonWorkHourAction, setDndNonWorkHourAction
    }) => {
      return (
        <Card className="dark:bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white"><BellOff className="mr-2 h-6 w-6 text-primary" />Do Not Disturb (DND) Mode</CardTitle>
            <CardDescription>Manage your visibility and call routing during certain times.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dndEnabled" className="dark:text-gray-300 font-medium">Enable Do Not Disturb Mode</Label>
              <Switch id="dndEnabled" checked={dndEnabled} onCheckedChange={setDndEnabled} className="data-[state=checked]:bg-primary" />
            </div>

            {dndEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dndScheduleActive" className="dark:text-gray-300">Use Visibility Schedule</Label>
                  <Switch id="dndScheduleActive" checked={dndScheduleActive} onCheckedChange={setDndScheduleActive} className="data-[state=checked]:bg-primary" />
                </div>
                <p className="text-xs text-muted-foreground -mt-3">If off, DND is always active when enabled. If on, DND applies outside of specified "visible" work hours.</p>

                {dndScheduleActive && (
                  <div className="space-y-4 p-4 border dark:border-slate-700 rounded-md">
                    <p className="text-sm font-medium dark:text-gray-300">Set Visible Work Hours (When you ARE available):</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dndWorkHoursStart1" className="text-xs dark:text-gray-400">Visible From (Period 1)</Label>
                        <Input type="time" id="dndWorkHoursStart1" value={dndWorkHoursStart1} onChange={e => setDndWorkHoursStart1(e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
                      </div>
                      <div>
                        <Label htmlFor="dndWorkHoursEnd1" className="text-xs dark:text-gray-400">Visible Until (Period 1)</Label>
                        <Input type="time" id="dndWorkHoursEnd1" value={dndWorkHoursEnd1} onChange={e => setDndWorkHoursEnd1(e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dndWorkHoursStart2" className="text-xs dark:text-gray-400">Visible From (Period 2 - Optional)</Label>
                        <Input type="time" id="dndWorkHoursStart2" value={dndWorkHoursStart2} onChange={e => setDndWorkHoursStart2(e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
                      </div>
                      <div>
                        <Label htmlFor="dndWorkHoursEnd2" className="text-xs dark:text-gray-400">Visible Until (Period 2 - Optional)</Label>
                        <Input type="time" id="dndWorkHoursEnd2" value={dndWorkHoursEnd2} onChange={e => setDndWorkHoursEnd2(e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="dndNonWorkHourAction" className="dark:text-gray-300">During DND / Non-Work Hours:</Label>
                  <select 
                    id="dndNonWorkHourAction" 
                    value={dndNonWorkHourAction} 
                    onChange={e => setDndNonWorkHourAction(e.target.value)}
                    className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  >
                    <option value="showDNDIcon">Show my name with "Do Not Disturb" icon</option>
                    <option value="hideFromDirectory">Temporarily remove my name from directory</option>
                  </select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );
    };

    export default DoNotDisturbSettings;