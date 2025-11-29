import React from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Filter, ChevronDown, ChevronUp, FileText, DoorOpen, AlertTriangle, KeyRound, Clock, Users, User as UserIcon, Tv2 } from 'lucide-react';
    import { reportTypes } from '@/lib/reportUtils';


    const iconMap = {
        DoorOpen: <DoorOpen className="inline mr-2 h-4 w-4"/>,
        AlertTriangle: <AlertTriangle className="inline mr-2 h-4 w-4"/>,
        KeyRound: <KeyRound className="inline mr-2 h-4 w-4"/>,
        Clock: <Clock className="inline mr-2 h-4 w-4"/>,
        Users: <Users className="inline mr-2 h-4 w-4"/>,
        User: <UserIcon className="inline mr-2 h-4 w-4"/>,
        Tv2: <Tv2 className="inline mr-2 h-4 w-4"/>,
    };

    const ReportFilterControls = ({
      selectedReportType,
      setSelectedReportType,
      filters,
      handleFilterChange,
      showAdvancedFilters,
      setShowAdvancedFilters,
      allResidents,
      buildingDoors,
      buildingUnits,
      visibleReportTypes,
      onGenerateReport,
      isGenerating
    }) => {

      const currentReportConfig = reportTypes.find(rt => rt.value === selectedReportType);
      const availableFilters = currentReportConfig?.filters || [];

      const renderBasicFilterInputs = () => {
        const inputs = [];
        if (availableFilters.includes('dateRange')) {
          inputs.push(
            <div key="startDate-filter" className="space-y-1">
              <Label htmlFor="startDate" className="dark:text-gray-300">Start Date</Label>
              <Input id="startDate" type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
            </div>,
            <div key="endDate-filter" className="space-y-1">
              <Label htmlFor="endDate" className="dark:text-gray-300">End Date</Label>
              <Input id="endDate" type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" />
            </div>
          );
        }
        if (availableFilters.includes('user')) {
          inputs.push(
            <div key="user-filter" className="space-y-1">
              <Label htmlFor="user" className="dark:text-gray-300">User/Resident Name</Label>
              <Input id="user" type="text" placeholder="Enter name" value={filters.user} onChange={(e) => handleFilterChange('user', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
          );
        }
        if (availableFilters.includes('door')) {
          inputs.push(
            <div key="door-filter" className="space-y-1">
              <Label htmlFor="door" className="dark:text-gray-300">Door</Label>
              <Select value={filters.door} onValueChange={(val) => handleFilterChange('door', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="All Doors" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all_doors">All Doors</SelectItem>
                  {buildingDoors.map(d => d.id && <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return inputs;
      };
      
      const renderAdvancedFilterInputs = () => {
        const advInputs = [];
        if (availableFilters.includes('accessType')) {
          advInputs.push(
            <div key="accessType-filter" className="space-y-1">
              <Label htmlFor="accessType" className="dark:text-gray-300">Access Type</Label>
              <Select value={filters.accessType} onValueChange={(val) => handleFilterChange('accessType', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="All Access Types" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="passcode">Passcode</SelectItem>
                  <SelectItem value="keyfob">Key Fob</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (availableFilters.includes('reason')) {
           advInputs.push(
            <div key="reason-filter" className="space-y-1">
              <Label htmlFor="reason" className="dark:text-gray-300">Failure Reason</Label>
              <Select value={filters.reason} onValueChange={(val) => handleFilterChange('reason', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="All Reasons" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="invalid_passcode">Invalid Passcode</SelectItem>
                  <SelectItem value="unknown_user">Unknown User</SelectItem>
                  <SelectItem value="card_expired">Card Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (availableFilters.includes('timeOfDay')) {
           advInputs.push(
            <div key="timeOfDay-filter" className="space-y-1">
              <Label htmlFor="timeOfDay" className="dark:text-gray-300">Time of Day</Label>
              <Select value={filters.timeOfDay} onValueChange={(val) => handleFilterChange('timeOfDay', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="All Day" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all">All Day</SelectItem>
                  <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM-6PM)</SelectItem>
                  <SelectItem value="evening">Evening (6PM-12AM)</SelectItem>
                  <SelectItem value="night">Night (12AM-6AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (availableFilters.includes('resident')) {
           advInputs.push(
            <div key="resident-filter" className="space-y-1">
              <Label htmlFor="resident" className="dark:text-gray-300">Resident</Label>
              <Select value={filters.resident} onValueChange={(val) => handleFilterChange('resident', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="Select Resident" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all_residents">All Residents</SelectItem>
                  {allResidents.map(r => r.id && <SelectItem key={r.id} value={r.id}>{r.name} ({r.unit})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (availableFilters.includes('visitorName')) {
           advInputs.push(
            <div key="visitorName-filter" className="space-y-1">
              <Label htmlFor="visitorName" className="dark:text-gray-300">Visitor Name</Label>
              <Input id="visitorName" type="text" placeholder="Enter visitor name" value={filters.visitorName} onChange={(e) => handleFilterChange('visitorName', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
          );
        }
        if (availableFilters.includes('unitNumber')) {
           advInputs.push(
            <div key="unitNumber-filter" className="space-y-1">
              <Label htmlFor="unitNumber" className="dark:text-gray-300">Unit Number</Label>
              <Select value={filters.unitNumber} onValueChange={(val) => handleFilterChange('unitNumber', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="All Units" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all_units">All Units</SelectItem>
                  {buildingUnits.map(u => u && <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (availableFilters.includes('kioskEvent')) {
           advInputs.push(
            <div key="kioskEvent-filter" className="space-y-1">
              <Label htmlFor="kioskEvent" className="dark:text-gray-300">Kiosk Event Type</Label>
              <Select value={filters.kioskEvent} onValueChange={(val) => handleFilterChange('kioskEvent', val)}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600"><SelectValue placeholder="All Events" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="directory_search">Directory Search</SelectItem>
                  <SelectItem value="passcode_entry">Passcode Entry</SelectItem>
                  <SelectItem value="call_attempt">Call Attempt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }
        return advInputs;
      };


      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white">
              <Filter className="mr-2 h-5 w-5 text-primary" /> Report Configuration
            </CardTitle>
            <CardDescription>Select report type and apply filters to generate your report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="reportType" className="dark:text-gray-300">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger id="reportType" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  {visibleReportTypes.map(rt => (
                    <SelectItem key={rt.value} value={rt.value} className="dark:hover:bg-slate-700">
                      {iconMap[rt.icon] || <Filter className="inline mr-2 h-4 w-4"/>} {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderBasicFilterInputs()}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-filters" className="border-none">
                <AccordionTrigger onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="text-sm font-medium text-primary hover:no-underline dark:text-purple-400 flex items-center justify-start p-0">
                   {showAdvancedFilters ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />} Advanced Filters
                </AccordionTrigger>
                <AccordionContent>
                  <AnimatePresence>
                  {showAdvancedFilters && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700 mt-2"
                    >
                      {renderAdvancedFilterInputs()}
                    </motion.div>
                  )}
                  </AnimatePresence>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-end">
              <Button onClick={onGenerateReport} disabled={isGenerating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <FileText className="mr-2 h-4 w-4" /> {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default ReportFilterControls;