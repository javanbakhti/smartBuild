import React, { useState, useEffect } from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';

    const VisitorForm = ({
      visitorData,
      onInputChange,
      onSubmit,
      unitOptions,
      isEditing = false,
    }) => {
      const { toast } = useToast();
      const {
        name = '',
        unitNumber = '',
        expectedDate = '',
        expectedTime = '',
        status = 'expected',
        accessType = 'single', 
        expirationType = 'relative', 
        expirationDays = '1', 
        expirationHours = '0',
        absoluteExpirationDate = '',
        absoluteExpirationTime = '',
        usageLimit = '',
        companyName = '',
        supervisorName = '',
        supervisorContact = '',
        visitorEmail = '',
        visitorPhone = '',
        comment = '',
      } = visitorData;

      const [currentExpirationType, setCurrentExpirationType] = useState(expirationType);

      useEffect(() => {
        setCurrentExpirationType(visitorData.expirationType || 'relative');
      }, [visitorData.expirationType]);
      
      const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!name || !unitNumber || !expectedDate || !expectedTime) {
          toast({ title: "Error", description: "Visitor Name, Unit, Expected Date, and Time are required.", variant: "destructive" });
          return;
        }
        if (currentExpirationType === 'absolute' && (!visitorData.absoluteExpirationDate || !visitorData.absoluteExpirationTime)) {
          toast({ title: "Error", description: "Specific expiration date and time are required for absolute expiration.", variant: "destructive" });
          return;
        }
        if (accessType === 'multiple' && visitorData.usageLimit && parseInt(visitorData.usageLimit, 10) <= 0) {
            toast({ title: "Error", description: "Usage limit must be a positive number if set.", variant: "destructive" });
            return;
        }
        onSubmit({ ...visitorData, expirationType: currentExpirationType });
      };

      const handleRadioChange = (value) => {
        setCurrentExpirationType(value);
        onInputChange({ target: { name: 'expirationType', value }});
      }

      return (
        <form onSubmit={handleFormSubmit} className="grid gap-4 py-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="dark:text-gray-300">Visitor Name</Label>
            <Input id="name" name="name" value={name} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="e.g., Alice Wonderland" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unitNumber" className="dark:text-gray-300">Visiting Unit No.</Label>
            <select id="unitNumber" name="unitNumber" value={unitNumber} onChange={onInputChange} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600" required>
              <option value="">Select Unit</option>
              {unitOptions.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="expectedDate" className="dark:text-gray-300">Expected Date</Label>
              <Input id="expectedDate" name="expectedDate" type="date" value={expectedDate} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="expectedTime" className="dark:text-gray-300">Expected Time</Label>
              <Input id="expectedTime" name="expectedTime" type="time" value={expectedTime} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label htmlFor="visitorEmail" className="dark:text-gray-300">Visitor Email (Optional)</Label>
                <Input id="visitorEmail" name="visitorEmail" type="email" value={visitorEmail} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="visitor@example.com" />
            </div>
            <div className="space-y-1">
                <Label htmlFor="visitorPhone" className="dark:text-gray-300">Visitor Phone (Optional)</Label>
                <Input id="visitorPhone" name="visitorPhone" type="tel" value={visitorPhone} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="+15551234567" />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="accessType" className="dark:text-gray-300">Access Type</Label>
            <select id="accessType" name="accessType" value={accessType} onChange={onInputChange} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600">
              <option value="single">Single Entry</option>
              <option value="multiple">Multiple Entry</option>
            </select>
          </div>

          <Label className="dark:text-gray-300 pt-2">Expiration Settings</Label>
          <RadioGroup name="expirationType" value={currentExpirationType} onValueChange={handleRadioChange} className="flex space-x-4 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relative" id="relative" />
              <Label htmlFor="relative">Relative (Days/Hours from Expected Time)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="absolute" id="absolute" />
              <Label htmlFor="absolute">Absolute (Specific Date & Time)</Label>
            </div>
          </RadioGroup>

          {currentExpirationType === 'relative' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="expirationDays" className="dark:text-gray-300">Days</Label>
                <Input id="expirationDays" name="expirationDays" type="number" min="0" value={expirationDays} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="expirationHours" className="dark:text-gray-300">Hours</Label>
                <Input id="expirationHours" name="expirationHours" type="number" min="0" max="23" value={expirationHours} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
            </div>
          )}

          {currentExpirationType === 'absolute' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="absoluteExpirationDate" className="dark:text-gray-300">Expiration Date</Label>
                <Input id="absoluteExpirationDate" name="absoluteExpirationDate" type="date" value={absoluteExpirationDate} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" required={currentExpirationType === 'absolute'} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="absoluteExpirationTime" className="dark:text-gray-300">Expiration Time</Label>
                <Input id="absoluteExpirationTime" name="absoluteExpirationTime" type="time" value={absoluteExpirationTime} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:[color-scheme:dark]" required={currentExpirationType === 'absolute'} />
              </div>
            </div>
          )}
          
          {accessType === 'multiple' && (
            <div className="space-y-1">
              <Label htmlFor="usageLimit" className="dark:text-gray-300">Max Allowed Entries (Optional)</Label>
              <Input id="usageLimit" name="usageLimit" type="number" min="1" value={usageLimit} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Unlimited if blank" />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="companyName" className="dark:text-gray-300">Company Name (If applicable)</Label>
            <Input id="companyName" name="companyName" value={companyName} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="e.g., Tech Solutions Inc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="supervisorName" className="dark:text-gray-300">Supervisor Name (If applicable)</Label>
              <Input id="supervisorName" name="supervisorName" value={supervisorName} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="supervisorContact" className="dark:text-gray-300">Supervisor Contact (If applicable)</Label>
              <Input id="supervisorContact" name="supervisorContact" value={supervisorContact} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Email or Phone" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="comment" className="dark:text-gray-300">Comment (Optional)</Label>
            <Textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={onInputChange}
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              placeholder="e.g., Delivery instructions, reason for visit..."
              rows={3}
            />
          </div>

          {isEditing && (
            <div className="space-y-1">
              <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
              <select id="status" name="status" value={status} onChange={onInputChange} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600">
                <option value="expected">Expected</option>
                <option value="arrived">Arrived</option>
                <option value="departed">Departed</option>
                <option value="denied">Denied</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
            {isEditing ? 'Save Changes' : 'Add Visitor'}
          </Button>
        </form>
      );
    };

    export default VisitorForm;