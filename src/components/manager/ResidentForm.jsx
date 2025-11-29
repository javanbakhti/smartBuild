import React, { useState, useEffect } from 'react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { CalendarDays as CalendarIcon, Eye, Loader2 } from 'lucide-react';
    import { format, addDays } from 'date-fns';

    const ResidentForm = ({
      residentData,
      onInputChange,
      onSubmit,
      isEditing = false,
      availableUnits,
      onUnitSelection,
      onPreviewInvitation,
      allUnits,
      isSubmitting
    }) => {
      const { toast } = useToast();
      const {
        fullName = '',
        nickname = '',
        email = '',
        cellphoneNumber = '',
        unitNumber: currentUnitNumber = '',
        floorNumber: currentFloorNumber = '',
        kioskDisplayName = '',
        passcode = '',
        invitationSendMethod = 'email',
        invitationExpirationDate = null,
      } = residentData;

      const [localInvitationExpirationDate, setLocalInvitationExpirationDate] = useState(invitationExpirationDate ? new Date(invitationExpirationDate) : null);

      useEffect(() => {
        setLocalInvitationExpirationDate(invitationExpirationDate ? new Date(invitationExpirationDate) : null);
      }, [invitationExpirationDate]);

      const handleDateSelect = (date) => {
        setLocalInvitationExpirationDate(date);
        onInputChange({ target: { name: 'invitationExpirationDate', value: date ? date.toISOString() : null } });
      };

      const validateEmail = (emailToValidate) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
      const validatePhone = (phone) => /^\+?[1-9]\d{1,14}$/.test(phone); 

      const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!fullName || !email || !currentUnitNumber || !currentFloorNumber) {
          toast({ title: "Error", description: "Full Name, Email, Unit, and Floor are required.", variant: "destructive" });
          return;
        }
        if (!validateEmail(email)) {
          toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
          return;
        }
        if (cellphoneNumber && !validatePhone(cellphoneNumber)) {
          toast({ title: "Invalid Phone Number", description: "Please enter a valid phone number (e.g., +15551234567).", variant: "destructive" });
          return;
        }
        if (passcode && (passcode.length < 4 || passcode.length > 8 || !/^\d+$/.test(passcode))) {
          toast({ title: "Error", description: "Passcode must be 4-8 digits.", variant: "destructive" });
          return;
        }
        if (!isEditing && !localInvitationExpirationDate) {
          toast({ title: "Error", description: "Invitation expiration date is required.", variant: "destructive" });
          return;
        }
        onSubmit();
      };
      
      const currentUnitValue = currentUnitNumber ? `${currentUnitNumber}` : "";
      const currentResidentUnit = { unit: currentUnitNumber, floor: currentFloorNumber };

      return (
        <form onSubmit={handleFormSubmit} className="grid gap-4 py-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="dark:text-gray-300">Full Name <span className="text-red-500">*</span></Label>
              <Input id="fullName" name="fullName" value={fullName} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" required />
            </div>
            <div>
              <Label htmlFor="nickname" className="dark:text-gray-300">Nickname</Label>
              <Input id="nickname" name="nickname" value={nickname} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="dark:text-gray-300">Email <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" value={email} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" required />
            </div>
            <div>
              <Label htmlFor="cellphoneNumber" className="dark:text-gray-300">Cellphone Number</Label>
              <Input id="cellphoneNumber" name="cellphoneNumber" type="tel" value={cellphoneNumber} onChange={onInputChange} placeholder="e.g., +15551234567" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
          </div>
          <div>
            <Label htmlFor="unitNumberSelect" className="dark:text-gray-300">Unit Number <span className="text-red-500">*</span></Label>
            <Select value={currentUnitValue} onValueChange={onUnitSelection} required>
              <SelectTrigger className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700 dark:text-white">
                {isEditing && currentResidentUnit && currentResidentUnit.unit && !availableUnits.find(u => u.unit === currentResidentUnit.unit) && (
                  <SelectItem key={`current-${currentResidentUnit.unit}`} value={currentResidentUnit.unit}>
                    {currentResidentUnit.unit} (Floor {currentResidentUnit.floor}) - Current
                  </SelectItem>
                )}
                {availableUnits.map(opt => (
                  <SelectItem key={opt.unit} value={opt.unit}>
                    {opt.unit} (Floor {opt.floor}) {opt.label ? `- ${opt.label}` : ''}
                  </SelectItem>
                ))}
                {availableUnits.length === 0 && (!isEditing || !currentResidentUnit.unit) && (
                    <SelectItem value="no-units" disabled>No available units</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input type="hidden" name="floorNumber" value={currentFloorNumber} />
            <Input type="hidden" name="unitNumber" value={currentUnitNumber} />
          </div>
          <div>
            <Label htmlFor="kioskDisplayName" className="dark:text-gray-300">Display Name for Kiosk</Label>
            <Input id="kioskDisplayName" name="kioskDisplayName" value={kioskDisplayName} onChange={onInputChange} placeholder="Defaults to Full Name" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
          </div>
          <div>
            <Label htmlFor="passcode" className="dark:text-gray-300">Kiosk Passcode (4-8 digits)</Label>
            <Input id="passcode" name="passcode" type="password" value={passcode} onChange={(e) => onInputChange({ target: { name: 'passcode', value: e.target.value.replace(/\D/g,'').slice(0,8) }})} maxLength={8} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Send Invitation Via <span className="text-red-500">*</span></Label>
                <RadioGroup
                  name="invitationSendMethod"
                  value={invitationSendMethod}
                  onValueChange={(value) => onInputChange({ target: { name: 'invitationSendMethod', value } })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="sendEmail" className="dark:border-slate-500 dark:text-primary data-[state=checked]:border-primary"/>
                    <Label htmlFor="sendEmail" className="dark:text-gray-300">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sendSms" className="dark:border-slate-500 dark:text-primary data-[state=checked]:border-primary"/>
                    <Label htmlFor="sendSms" className="dark:text-gray-300">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="sendBoth" className="dark:border-slate-500 dark:text-primary data-[state=checked]:border-primary"/>
                    <Label htmlFor="sendBoth" className="dark:text-gray-300">Both</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitationExpirationDate" className="dark:text-gray-300">Invitation Expiration Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal dark:bg-slate-700 dark:text-white dark:border-slate-600 ${!localInvitationExpirationDate && "text-muted-foreground"}`}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localInvitationExpirationDate ? format(localInvitationExpirationDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 dark:bg-slate-800" align="start">
                    <Calendar
                      mode="single"
                      selected={localInvitationExpirationDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      fromDate={addDays(new Date(), 1)} 
                      className="dark:bg-slate-800 dark:text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="button" variant="outline" onClick={onPreviewInvitation} className="w-full dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700" disabled={isSubmitting}>
                <Eye className="mr-2 h-4 w-4" /> Preview Invitation
              </Button>
            </>
          )}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Inviting...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Invite Resident'
            )}
          </Button>
        </form>
      );
    };
    export default ResidentForm;