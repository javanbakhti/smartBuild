import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { FileText, Filter, Mail, Download, CalendarDays, User, DoorOpen, Tv2, AlertTriangle, Clock, KeyRound, Users, BarChart3, Settings2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion, AnimatePresence } from 'framer-motion';
    import { reportTypes, generateMockData, exportReportData, sendReportByEmailData } from '@/lib/reportUtils';
    import ReportFilterControls from '@/components/manager/reports/ReportFilterControls';
    import ReportPreview from '@/components/manager/reports/ReportPreview';
    import ReportScheduling from '@/components/manager/reports/ReportScheduling';
    import { format, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';

    const GenerateReports = () => {
      const { toast } = useToast();
      const [selectedReportType, setSelectedReportType] = useState(reportTypes[0].value);
      
      const [filters, setFilters] = useState({
        startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        user: '',
        door: 'all_doors', 
        accessType: 'all',
        reason: 'all',
        timeOfDay: 'all',
        resident: 'all_residents', 
        visitorName: '',
        unitNumber: 'all_units', 
        kioskEvent: 'all',
      });

      const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
      const [generatedReport, setGeneratedReport] = useState([]);
      const [reportTitle, setReportTitle] = useState('');
      const [isGenerating, setIsGenerating] = useState(false);
      const [scheduleReport, setScheduleReport] = useState(false);
      const [scheduleSettings, setScheduleSettings] = useState({
        frequency: 'daily',
        time: '09:00',
        dayOfWeek: 'Monday', 
        dayOfMonth: '1',
        destinationType: 'email',
        destinationEmail: '',
      });

      const [allResidents, setAllResidents] = useState([]);
      const [buildingDoors, setBuildingDoors] = useState([]);
      const [buildingUnits, setBuildingUnits] = useState([]);
      
      const currentUserRole = JSON.parse(localStorage.getItem('user'))?.role || 'manager';


      useEffect(() => {
        const storedResidents = JSON.parse(localStorage.getItem('residents')) || [];
        setAllResidents(storedResidents.map(r => ({ id: String(r.id), name: r.fullName, unit: r.unitNumber })).filter(r => r.id));

        const storedDoors = JSON.parse(localStorage.getItem('doors')) || [];
        setBuildingDoors(storedDoors.map(d => ({ id: String(d.id), name: d.name })).filter(d => d.id));

        const storedUnits = JSON.parse(localStorage.getItem('buildingUnits')) || [];
        setBuildingUnits(storedUnits.map(u => String(u.identifier)).filter(u => u));
      }, []);

      const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
      };
      
      const handleScheduleSettingChange = (key, value) => {
        setScheduleSettings(prev => ({ ...prev, [key]: value }));
      };

      const handleGenerateReport = () => {
        setIsGenerating(true);
        if (!filters.startDate || !filters.endDate) {
          toast({ title: "Error", description: "Start and End dates are required.", variant: "destructive" });
          setIsGenerating(false);
          return;
        }
        const sDate = startOfDay(parseISO(filters.startDate));
        const eDate = endOfDay(parseISO(filters.endDate));
        const currentReportConfig = reportTypes.find(rt => rt.value === selectedReportType);
        const title = `${currentReportConfig.label} (${format(sDate, 'MMM dd, yyyy')} - ${format(eDate, 'MMM dd, yyyy')})`;
        
        setTimeout(() => { 
          const data = generateMockData(selectedReportType, sDate, eDate, allResidents, buildingDoors, filters);
          
          let filteredData = data;
          
          if (selectedReportType === 'accessLog') {
            if (filters.user) filteredData = filteredData.filter(item => item.user?.toLowerCase().includes(filters.user.toLowerCase()));
            if (filters.door && filters.door !== 'all_doors') filteredData = filteredData.filter(item => item.door === filters.door);
            if (filters.accessType !== 'all') filteredData = filteredData.filter(item => item.accessType?.toLowerCase() === filters.accessType.toLowerCase());
          } else if (selectedReportType === 'visitorLog') {
            if (filters.visitorName) filteredData = filteredData.filter(item => item.visitorName?.toLowerCase().includes(filters.visitorName.toLowerCase()));
            if (filters.unitNumber && filters.unitNumber !== 'all_units') filteredData = filteredData.filter(item => item.unitNumber === filters.unitNumber);
          } else if (selectedReportType === 'residentSpecificAccess') {
            if (filters.resident && filters.resident !== 'all_residents') {
                const residentObj = allResidents.find(r => r.id === filters.resident);
                if (residentObj) {
                    filteredData = filteredData.filter(item => item.resident === residentObj.name);
                } else {
                    filteredData = []; 
                }
            }
          }


          setGeneratedReport(filteredData);
          setReportTitle(title);
          setIsGenerating(false);
          if (filteredData.length > 0) {
            toast({ title: "Report Generated", description: `${title} created with ${filteredData.length} entries.` });
          } else {
            toast({ title: "No Data", description: `No data found for the selected criteria.`, variant: "default" });
          }
        }, 1500);
      };

      const handleExportReport = (formatType) => {
        exportReportData(formatType, generatedReport, reportTitle, toast);
      };
      
      const handleSendReportByEmail = () => {
        sendReportByEmailData(generatedReport, reportTitle, toast);
      };

      const handleSaveScheduledReport = () => {
        if (!scheduleReport) {
            toast({ title: "Info", description: "Scheduling is not enabled."});
            return;
        }
        localStorage.setItem('scheduledReportSettings', JSON.stringify({ reportType: selectedReportType, filters, scheduleSettings }));
        toast({ title: "Scheduled Report Saved", description: `Report "${reportTypes.find(rt => rt.value === selectedReportType)?.label}" scheduled.` });
      };
      
      const visibleReportTypes = reportTypes.filter(rt => {
        if (currentUserRole === 'admin') return true; 
        if (rt.value === 'failedEntryAttempts' && currentUserRole !== 'manager') return false;
        return true;
      });


      return (
        <Layout role="manager">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                <BarChart3 className="mr-3 h-8 w-8 text-primary"/> Generate Reports
              </h1>
              <p className="text-muted-foreground">Create, view, and export system activity logs and reports.</p>
            </div>

            <ReportFilterControls
              selectedReportType={selectedReportType}
              setSelectedReportType={setSelectedReportType}
              filters={filters}
              handleFilterChange={handleFilterChange}
              showAdvancedFilters={showAdvancedFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              allResidents={allResidents}
              buildingDoors={buildingDoors}
              buildingUnits={buildingUnits}
              visibleReportTypes={visibleReportTypes}
              onGenerateReport={handleGenerateReport}
              isGenerating={isGenerating}
            />
            
            <AnimatePresence>
            {generatedReport.length > 0 && reportTitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ReportPreview
                  reportTitle={reportTitle}
                  generatedReport={generatedReport}
                  onExport={handleExportReport}
                  onSendEmail={handleSendReportByEmail}
                />
              </motion.div>
            )}
            </AnimatePresence>

            <ReportScheduling
              scheduleReport={scheduleReport}
              setScheduleReport={setScheduleReport}
              scheduleSettings={scheduleSettings}
              handleScheduleSettingChange={handleScheduleSettingChange}
              onSaveScheduledReport={handleSaveScheduledReport}
            />
          </motion.div>
        </Layout>
      );
    };

    export default GenerateReports;