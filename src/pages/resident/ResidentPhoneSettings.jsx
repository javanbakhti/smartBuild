import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Phone, Save, PlusCircle, Trash2, ArrowDown, ArrowUp, Timer } from 'lucide-react';

    const ResidentPhoneSettings = () => {
      const { toast } = useToast();
      const [sipEnabled, setSipEnabled] = useState(false);
      const [phoneNumbers, setPhoneNumbers] = useState([{ id: 1, number: '' }]);
      const [callBehavior, setCallBehavior] = useState('simultaneous'); // 'simultaneous' or 'sequential'
      const [sequentialDelay, setSequentialDelay] = useState(20);

      const loadSettings = useCallback(() => {
        const managerSettings = JSON.parse(localStorage.getItem('managerPhoneSettings'));
        if (managerSettings) {
          setSipEnabled(managerSettings.sipEnabled);
        }
        const residentSettings = JSON.parse(localStorage.getItem('residentPhoneSettings'));
        if (residentSettings) {
          setPhoneNumbers(residentSettings.phoneNumbers.length > 0 ? residentSettings.phoneNumbers : [{ id: 1, number: '' }]);
          setCallBehavior(residentSettings.callBehavior || 'simultaneous');
          setSequentialDelay(residentSettings.sequentialDelay || 20);
        }
      }, []);

      useEffect(() => {
        loadSettings();
      }, [loadSettings]);

      const handlePhoneNumberChange = (id, value) => {
        setPhoneNumbers(prev => prev.map(p => p.id === id ? { ...p, number: value } : p));
      };

      const addPhoneNumber = () => {
        if (phoneNumbers.length < 3) {
          setPhoneNumbers(prev => [...prev, { id: Date.now(), number: '' }]);
        } else {
          toast({ title: "Limit Reached", description: "You can add a maximum of 3 phone numbers.", variant: "destructive" });
        }
      };

      const removePhoneNumber = (id) => {
        if (phoneNumbers.length > 1) {
          setPhoneNumbers(prev => prev.filter(p => p.id !== id));
        }
      };

      const movePhoneNumber = (index, direction) => {
        if (direction === 'up' && index > 0) {
          const newNumbers = [...phoneNumbers];
          [newNumbers[index], newNumbers[index - 1]] = [newNumbers[index - 1], newNumbers[index]];
          setPhoneNumbers(newNumbers);
        }
        if (direction === 'down' && index < phoneNumbers.length - 1) {
          const newNumbers = [...phoneNumbers];
          [newNumbers[index], newNumbers[index + 1]] = [newNumbers[index + 1], newNumbers[index]];
          setPhoneNumbers(newNumbers);
        }
      };

      const handleSaveSettings = () => {
        const settingsToSave = {
          phoneNumbers,
          callBehavior,
          sequentialDelay,
        };
        localStorage.setItem('residentPhoneSettings', JSON.stringify(settingsToSave));
        toast({
          title: 'Phone Settings Saved',
          description: 'Your phone numbers and call preferences have been updated.',
        });
      };

      return (
        <Layout role="resident">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                <Phone className="mr-3 h-8 w-8 text-primary" /> Phone Settings
              </h1>
              <p className="text-muted-foreground">Manage your phone numbers for receiving intercom calls.</p>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Your Phone Numbers</CardTitle>
                <CardDescription>
                  {sipEnabled
                    ? "SIP trunking is enabled by the manager. You can add up to 3 phone numbers."
                    : "Enter the primary phone number for receiving calls from the intercom."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {phoneNumbers.map((phone, index) => (
                  <div key={phone.id} className="flex items-center space-x-2">
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone.number}
                      onChange={(e) => handlePhoneNumberChange(phone.id, e.target.value)}
                      className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                    />
                    {sipEnabled && callBehavior === 'sequential' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => movePhoneNumber(index, 'up')} disabled={index === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => movePhoneNumber(index, 'down')} disabled={index === phoneNumbers.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {sipEnabled && phoneNumbers.length > 1 && (
                      <Button variant="destructive" size="icon" onClick={() => removePhoneNumber(phone.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {sipEnabled && phoneNumbers.length < 3 && (
                  <Button variant="outline" onClick={addPhoneNumber}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Phone Number
                  </Button>
                )}
              </CardContent>
            </Card>

            {sipEnabled && phoneNumbers.length > 1 && (
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Call Behavior</CardTitle>
                  <CardDescription>Choose how multiple numbers should be called.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={callBehavior} onValueChange={setCallBehavior}>
                    <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue placeholder="Select call behavior" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                      <SelectItem value="simultaneous">Ring Simultaneously</SelectItem>
                      <SelectItem value="sequential">Ring Sequentially</SelectItem>
                    </SelectContent>
                  </Select>

                  {callBehavior === 'sequential' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="sequentialDelay" className="flex items-center text-muted-foreground dark:text-gray-300">
                        <Timer className="mr-2 h-4 w-4" /> Delay Between Calls (seconds)
                      </Label>
                      <Input
                        id="sequentialDelay"
                        type="number"
                        value={sequentialDelay}
                        onChange={(e) => setSequentialDelay(Number(e.target.value))}
                        min="5"
                        max="60"
                        className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                      />
                      <p className="text-xs text-muted-foreground">Time to wait before calling the next number in the sequence.</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-5 w-5" /> Save My Phone Settings
              </Button>
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default ResidentPhoneSettings;