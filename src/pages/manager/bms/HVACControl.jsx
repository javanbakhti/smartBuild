import React from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Thermometer, Fan, Power } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Slider } from '@/components/ui/slider';
    import { Label } from '@/components/ui/label';
    import { motion } from 'framer-motion';

    const HVACControl = () => {
      const [temperature, setTemperature] = React.useState(22);
      const [fanSpeed, setFanSpeed] = React.useState(2);
      const [hvacStatus, setHvacStatus] = React.useState("On");

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <Thermometer className="mr-3 h-8 w-8 text-primary" /> HVAC Control
                </h1>
                <p className="text-muted-foreground">Manage heating, ventilation, and air conditioning systems for common areas.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${hvacStatus === "On" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"}`}>
                  System: {hvacStatus}
                </span>
                <Button 
                  variant={hvacStatus === "On" ? "destructive" : "outline"} 
                  size="sm" 
                  onClick={() => setHvacStatus(prev => prev === "On" ? "Off" : "On")}
                  className="dark:text-gray-300 dark:border-gray-600"
                >
                  <Power className="mr-2 h-4 w-4" /> Turn {hvacStatus === "On" ? "Off" : "On"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center"><Thermometer className="mr-2 h-5 w-5 text-red-500"/>Temperature Control</CardTitle>
                  <CardDescription>Adjust target temperature for common areas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="temperature" className="dark:text-gray-300">Target Temperature:</Label>
                    <span className="text-2xl font-bold text-primary">{temperature}°C</span>
                  </div>
                  <Slider
                    id="temperature"
                    min={16}
                    max={30}
                    step={1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                    disabled={hvacStatus === "Off"}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>16°C (Cool)</span>
                    <span>30°C (Warm)</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center"><Fan className="mr-2 h-5 w-5 text-blue-500"/>Fan Speed Control</CardTitle>
                  <CardDescription>Set common area ventilation fan speed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="fanSpeed" className="dark:text-gray-300">Fan Speed:</Label>
                    <span className="text-lg font-semibold text-primary">
                      {fanSpeed === 0 ? 'Off' : fanSpeed === 1 ? 'Low' : fanSpeed === 2 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <Slider
                    id="fanSpeed"
                    min={0}
                    max={3}
                    step={1}
                    value={[fanSpeed]}
                    onValueChange={(value) => setFanSpeed(value[0])}
                    disabled={hvacStatus === "Off"}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Off</span>
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="dark:text-white">System Status & Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Currently, the HVAC system is <span className="font-semibold">{hvacStatus}</span> and operating normally. 
                        No active alerts. (This is a mock interface)
                    </p>
                </CardContent>
            </Card>

          </motion.div>
        </Layout>
      );
    };

    export default HVACControl;