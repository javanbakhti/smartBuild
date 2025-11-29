import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemEventLogs = ({ logs, logsEndRef }) => (
  <footer className="mt-3 md:mt-4">
    <Card className="bg-black/40 backdrop-blur-sm border-white/10 shadow-lg max-h-32 md:max-h-40 overflow-hidden">
      <CardHeader className="p-1.5 md:p-2 border-b border-white/10">
        <CardTitle className="text-xs md:text-sm font-semibold text-white/80">System Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-1.5 md:p-2 text-xs text-gray-300 overflow-y-auto h-full max-h-24 md:max-h-32">
        {logs.map((log, index) => (
          <div key={index} className="font-mono leading-tight">
            <span className="text-purple-300/70">{log.timestamp}</span>: <span className="text-gray-400">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </CardContent>
    </Card>
  </footer>
);

export default SystemEventLogs;