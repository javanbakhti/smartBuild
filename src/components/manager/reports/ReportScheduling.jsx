import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Switch } from '@/components/ui/switch';
    import { Settings2 } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';

    const ReportScheduling = ({
      scheduleReport,
      setScheduleReport,
      scheduleSettings,
      handleScheduleSettingChange,
      onSaveScheduledReport
    }) => {
      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white">
              <Settings2 className="mr-2 h-5 w-5 text-primary" /> Schedule Report
            </CardTitle>
            <CardDescription>Set up recurring reports to be generated and sent automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="scheduleReportToggle" checked={scheduleReport} onCheckedChange={setScheduleReport} />
              <Label htmlFor="scheduleReportToggle" className="dark:text-gray-300">Enable Report Scheduling</Label>
            </div>
            <AnimatePresence>
            {scheduleReport && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4 border-t dark:border-slate-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduleFrequency" className="dark:text-gray-300">Frequency</Label>
                    <Select value={scheduleSettings.frequency} onValueChange={(val) => handleScheduleSettingChange('frequency', val)}>
                      <SelectTrigger id="scheduleFrequency" className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduleTime" className="dark:text-gray-300">Time</Label>
                    <Input id="scheduleTime" type="time" value={scheduleSettings.time} onChange={(e) => handleScheduleSettingChange('time', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
                  </div>
                </div>
                {scheduleSettings.frequency === 'weekly' && (
                  <div>
                    <Label htmlFor="scheduleDayOfWeek" className="dark:text-gray-300">Day of Week</Label>
                    <Select value={scheduleSettings.dayOfWeek} onValueChange={(val) => handleScheduleSettingChange('dayOfWeek', val)}>
                      <SelectTrigger id="scheduleDayOfWeek" className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {scheduleSettings.frequency === 'monthly' && (
                  <div>
                    <Label htmlFor="scheduleDayOfMonth" className="dark:text-gray-300">Day of Month</Label>
                    <Input id="scheduleDayOfMonth" type="number" min="1" max="31" value={scheduleSettings.dayOfMonth} onChange={(e) => handleScheduleSettingChange('dayOfMonth', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                  </div>
                )}
                <div>
                  <Label htmlFor="scheduleDestinationType" className="dark:text-gray-300">Destination</Label>
                  <Select value={scheduleSettings.destinationType} onValueChange={(val) => handleScheduleSettingChange('destinationType', val)}>
                    <SelectTrigger id="scheduleDestinationType" className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue /></SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white">
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="archive">Archive (System Storage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {scheduleSettings.destinationType === 'email' && (
                  <div>
                    <Label htmlFor="scheduleDestinationEmail" className="dark:text-gray-300">Recipient Email</Label>
                    <Input id="scheduleDestinationEmail" type="email" placeholder="report-recipient@example.com" value={scheduleSettings.destinationEmail} onChange={(e) => handleScheduleSettingChange('destinationEmail', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                  </div>
                )}
                <Button onClick={onSaveScheduledReport} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Schedule</Button>
              </motion.div>
            )}
            </AnimatePresence>
          </CardContent>
        </Card>
      );
    };
    export default ReportScheduling;