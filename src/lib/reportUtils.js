import { format } from 'date-fns';

    export const reportTypes = [
      { value: 'accessLog', label: 'Access Log', icon: 'DoorOpen', filters: ['dateRange', 'user', 'door', 'accessType'] },
      { value: 'failedEntryAttempts', label: 'Failed Entry Attempts', icon: 'AlertTriangle', filters: ['dateRange', 'door', 'reason'] },
      { value: 'entryMethodComparison', label: 'Entry by Passcode vs. Call', icon: 'KeyRound', filters: ['dateRange', 'door'] },
      { value: 'doorUsageByTime', label: 'Door Usage by Time of Day', icon: 'Clock', filters: ['dateRange', 'door', 'timeOfDay'] },
      { value: 'residentSpecificAccess', label: 'Resident-Specific Access', icon: 'Users', filters: ['dateRange', 'resident'] },
      { value: 'visitorLog', label: 'Visitor Log', icon: 'User', filters: ['dateRange', 'visitorName', 'unitNumber'] },
      { value: 'kioskActivity', label: 'Kiosk Activity', icon: 'Tv2', filters: ['dateRange', 'kioskEvent'] },
    ];

    export const generateMockData = (reportTypeKey, sDate, eDate, allResidentsData, buildingDoorsData, currentFilters) => {
      const mockData = [];
      const numEntries = Math.floor(Math.random() * 20) + 5;
      const allResidents = allResidentsData || [];
      const buildingDoors = buildingDoorsData || [];
      const filters = currentFilters || {};

      for (let i = 0; i < numEntries; i++) {
        const randomTimestamp = new Date(sDate.getTime() + Math.random() * (eDate.getTime() - sDate.getTime()));
        const randomResident = allResidents.length > 0 ? allResidents[Math.floor(Math.random() * allResidents.length)] : { name: 'Resident Mock', unit: '101', id: 'mock_res_id' };
        const randomDoorObj = buildingDoors.length > 0 ? buildingDoors[Math.floor(Math.random() * buildingDoors.length)] : { name: 'Main Door', id: 'mock_door_id' };
        const randomDoorName = randomDoorObj.name;

        switch (reportTypeKey) {
          case 'accessLog':
            mockData.push({ 
              id: i, timestamp: randomTimestamp, user: randomResident.name, unit: randomResident.unit, door: randomDoorName, 
              accessType: ['App', 'Passcode', 'Key Fob'][Math.floor(Math.random()*3)], event: 'Access Granted' 
            });
            break;
          case 'failedEntryAttempts':
            mockData.push({ 
              id: i, timestamp: randomTimestamp, door: randomDoorName, 
              reason: ['Invalid Passcode', 'Unknown User', 'Card Expired'][Math.floor(Math.random()*3)], details: 'Attempt from IP 192.168.1.100'
            });
            break;
          case 'entryMethodComparison':
            mockData.push({
              id: i, timestamp: randomTimestamp, door: randomDoorName,
              method: Math.random() > 0.6 ? 'Passcode' : 'Call', unit: randomResident.unit, duration: `${Math.floor(Math.random()*30)+5}s`
            });
            break;
          case 'doorUsageByTime':
            mockData.push({
              id: i, door: randomDoorName, hour: randomTimestamp.getHours(), count: Math.floor(Math.random()*10)+1,
              dayOfWeek: format(randomTimestamp, 'EEEE')
            });
            break;
          case 'residentSpecificAccess':
            const targetResident = filters.resident && filters.resident !== 'all_residents' ? allResidents.find(r => r.id === filters.resident) : randomResident;
            mockData.push({
              id: i, timestamp: randomTimestamp, resident: targetResident?.name || randomResident.name, 
              unit: targetResident?.unit || randomResident.unit,
              door: randomDoorName, event: 'Entered Building'
            });
            break;
          case 'visitorLog':
            mockData.push({
              id: i, visitorName: `Visitor ${i+1}`, unitNumber: randomResident.unit, 
              expectedDateTime: randomTimestamp, status: ['Expected', 'Arrived', 'Departed'][Math.floor(Math.random()*3)],
              entryMethod: ['Passcode', 'Host Opened'][Math.floor(Math.random()*2)]
            });
            break;
          case 'kioskActivity':
            mockData.push({
              id: i, timestamp: randomTimestamp, 
              event: ['Directory Search', 'Passcode Entry', 'Call Attempt'][Math.floor(Math.random()*3)],
              details: `Details for event ${i+1}`, outcome: ['Success', 'Failed', 'No Answer'][Math.floor(Math.random()*3)]
            });
            break;
          default: break;
        }
      }
      return mockData;
    };

    export const exportReportData = (formatType, generatedReport, reportTitle, toast) => {
      if (!generatedReport || generatedReport.length === 0) {
        toast({ title: "Error", description: "Generate a report first.", variant: "destructive" });
        return;
      }
      toast({ title: `Exporting as ${formatType.toUpperCase()}`, description: `Preparing ${reportTitle} for download... (Simulated)` });
      
      if (formatType === 'csv' || formatType === 'excel') {
        const headers = Object.keys(generatedReport[0] || {}).join(',');
        const csvContent = generatedReport.map(row => 
          Object.values(row).map(value => {
            if (value instanceof Date) return format(value, 'yyyy-MM-dd HH:mm:ss');
            if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
            return value;
          }).join(',')
        ).join('\n');
        const csvData = `data:text/csv;charset=utf-8,${headers}\n${csvContent}`;
        const encodedUri = encodeURI(csvData);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportTitle.replace(/[^a-z0-9]/gi, '_')}.${formatType === 'excel' ? 'xlsx' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (formatType === 'pdf') {
        alert("PDF export is a conceptual feature and would require a dedicated library like jsPDF or a server-side solution.");
      }
    };

    export const sendReportByEmailData = (generatedReport, reportTitle, toast) => {
      if (!generatedReport || generatedReport.length === 0) {
        toast({ title: "Error", description: "Generate a report first.", variant: "destructive" });
        return;
      }
      const emailBody = generatedReport.map(item => JSON.stringify(item)).join('\n\n');
      const mailtoLink = `mailto:?subject=${encodeURIComponent(reportTitle)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      toast({ title: "Email Client Opened", description: "Report ready to be sent." });
    };