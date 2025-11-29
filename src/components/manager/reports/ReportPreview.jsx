import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { FileSpreadsheet, FileType, Mail } from 'lucide-react';
    import { format } from 'date-fns';

    const ReportPreview = ({ reportTitle, generatedReport, onExport, onSendEmail }) => {
      if (!generatedReport || generatedReport.length === 0) {
        return (
            <Card className="dark:bg-slate-800 shadow-lg mt-6">
                <CardHeader>
                    <CardTitle className="dark:text-white">Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">No report generated or no data found for the current filters.</p>
                </CardContent>
            </Card>
        );
      }

      const headers = Object.keys(generatedReport[0] || {}).filter(key => key !== 'id');

      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <CardTitle className="dark:text-white">{reportTitle}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onExport('csv')} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button variant="outline" onClick={() => onExport('excel')} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={() => onExport('pdf')} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                  <FileType className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" onClick={onSendEmail} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-700">
                    {headers.map(header => <TableHead key={header} className="dark:text-gray-300 capitalize">{header.replace(/([A-Z])/g, ' $1')}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReport.map((item, index) => (
                    <TableRow key={item.id || index} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                      {headers.map(header => (
                        <TableCell key={header} className="dark:text-gray-300">
                          {item[header] instanceof Date ? format(item[header], 'PPpp') : String(item[header])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default ReportPreview;