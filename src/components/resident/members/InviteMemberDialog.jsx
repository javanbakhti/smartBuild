import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Checkbox } from '@/components/ui/checkbox';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { AlertCircle, KeyRound, Mail, MessageSquare, Eye, Info, Shield } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

    const relationshipOptions = [
      'Daughter', 'Son', 'Mother', 'Father', 'Spouse', 'Roommate', 'Family Friend', 'Relative', 'Other'
    ];

    const InviteMemberDialog = ({ 
      isOpen, 
      onOpenChange, 
      formData, 
      onInputChange, 
      onCheckboxChange,
      onRadioGroupChange,
      onSelectChange,
      onSubmit, 
      isEditing,
      existingPasscodes = [],
      onPreviewInvitation,
      roles = [],
    }) => {
      const [passcodeError, setPasscodeError] = useState('');
      const [showOtherRelationship, setShowOtherRelationship] = useState(false);

      useEffect(() => {
        if (formData && formData.passcodeType === 'custom' && formData.customPasscode) {
          const pc = formData.customPasscode;
          if (!/^\d{4,8}$/.test(pc)) {
            setPasscodeError('Passcode must be 4-8 digits.');
          } else if (existingPasscodes.includes(pc)) {
            setPasscodeError('This passcode is already in use for this unit.');
          } else {
            setPasscodeError('');
          }
        } else {
          setPasscodeError('');
        }
      }, [formData?.customPasscode, formData?.passcodeType, existingPasscodes]);

      useEffect(() => {
        if (isOpen && formData?.relationship && !relationshipOptions.includes(formData.relationship)) {
          setShowOtherRelationship(true);
        } else if (!isOpen) {
          setShowOtherRelationship(false);
        }
      }, [isOpen, formData?.relationship]);

      if (!isOpen || !formData) {
        return null;
      }

      const handleRelationshipChange = (value) => {
        if (value === 'Other') {
          setShowOtherRelationship(true);
          onInputChange({ target: { name: 'relationship', value: '' } });
        } else {
          setShowOtherRelationship(false);
          onInputChange({ target: { name: 'relationship', value } });
        }
      };
      
      const getRelationshipValue = () => {
        if (showOtherRelationship) return 'Other';
        return formData.relationship && relationshipOptions.includes(formData.relationship) ? formData.relationship : '';
      };

      const getSubmitButtonText = () => {
        if (isEditing) return 'Save Changes';
        return 'Save & Prepare Invitation';
      };

      const handleInternalSubmit = () => {
        onSubmit();
      };
      
      const handlePreviewClick = () => {
        if (onPreviewInvitation) {
          onPreviewInvitation(formData);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-lg dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{isEditing ? 'Edit Member' : 'Invite New Member'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the details for this member.' : 'Invite a new member to your unit.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="dark:text-gray-300">Full Name</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={onInputChange} placeholder="John Doe" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={onInputChange} placeholder="member@example.com" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="dark:text-gray-300">Phone Number (for SMS/Login)</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber || ''} onChange={onInputChange} placeholder="+15551234567" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nickname" className="dark:text-gray-300">Nickname (Optional)</Label>
                <Input id="nickname" name="nickname" value={formData.nickname} onChange={onInputChange} placeholder="Johnny" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="relationship" className="dark:text-gray-300">Relationship (Optional)</Label>
                <Select value={getRelationshipValue()} onValueChange={handleRelationshipChange}>
                  <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <SelectValue placeholder="Select a relationship" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:text-white">
                    {relationshipOptions.map(option => (
                      <SelectItem key={option} value={option} className="dark:focus:bg-slate-700">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showOtherRelationship && (
                <div className="space-y-1">
                  <Label htmlFor="customRelationship" className="dark:text-gray-300">Please specify</Label>
                  <Input 
                    id="customRelationship" 
                    name="relationship" 
                    value={formData.relationship} 
                    onChange={onInputChange} 
                    placeholder="e.g., Grandparent"
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600" 
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="roleId" className="dark:text-gray-300 flex items-center"><Shield className="w-4 h-4 mr-2 text-primary" />Member Role</Label>
                <Select name="roleId" value={formData.roleId || ''} onValueChange={(value) => onSelectChange('roleId', value)} disabled={roles.length === 0}>
                  <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <SelectValue placeholder={roles.length > 0 ? "Select a role" : "No roles available"} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:text-white">
                    {roles.map(role => (
                        <SelectItem key={role.id} value={role.id} className="dark:focus:bg-slate-700">{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t dark:border-slate-700 mt-2 space-y-3">
                  {!isEditing && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="immediateAccess" 
                        name="immediateAccess"
                        checked={formData.immediateAccess} 
                        onCheckedChange={(checked) => onCheckboxChange('immediateAccess', checked)}
                        className="dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <Label htmlFor="immediateAccess" className="dark:text-gray-300 font-medium">Provide Immediate Access with Passcode</Label>
                    </div>
                  )}

                  {formData.immediateAccess && !isEditing && (
                    <div className="pl-6 space-y-3 border-l-2 border-primary/50 dark:border-primary/30 ml-2">
                      <div className="space-y-1">
                        <Label className="dark:text-gray-300 flex items-center"><KeyRound className="w-4 h-4 mr-2 text-primary"/>Passcode Type</Label>
                        <RadioGroup
                          name="passcodeType"
                          value={formData.passcodeType}
                          onValueChange={(value) => onRadioGroupChange('passcodeType', value)}
                          className="flex space-x-4 pt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="autoPasscode" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="autoPasscode" className="dark:text-gray-300">Auto-generate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="customPasscodeOption" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="customPasscodeOption" className="dark:text-gray-300">Custom</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {formData.passcodeType === 'custom' && (
                        <div className="space-y-1">
                          <Label htmlFor="customPasscode" className="dark:text-gray-300">Custom Passcode (4-8 digits)</Label>
                          <Input 
                            id="customPasscode" 
                            name="customPasscode" 
                            type="text" 
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={8}
                            value={formData.customPasscode} 
                            onChange={onInputChange} 
                            placeholder="e.g., 123456" 
                            className={`dark:bg-slate-700 dark:text-white dark:border-slate-600 ${passcodeError ? 'border-red-500 dark:border-red-500' : ''}`} 
                          />
                          {passcodeError && <p className="text-xs text-red-500 dark:text-red-400 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{passcodeError}</p>}
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <Label className="dark:text-gray-300">Include Passcode in Invitation via:</Label>
                        <RadioGroup
                          name="notifyVia"
                          value={formData.notifyVia}
                          onValueChange={(value) => onRadioGroupChange('notifyVia', value)}
                          className="flex space-x-4 pt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="notifyEmail" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="notifyEmail" className="dark:text-gray-300 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5"/>Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sms" id="notifySms" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="notifySms" className="dark:text-gray-300 flex items-center"><MessageSquare className="w-3.5 h-3.5 mr-1.5"/>SMS</Label>
                          </div>
                           <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="notifyBoth" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="notifyBoth" className="dark:text-gray-300">Both</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="enableMember"
                      name="isEnabled"
                      checked={formData.isEnabled}
                      onCheckedChange={(checked) => onCheckboxChange('isEnabled', checked)}
                      className="dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor="enableMember" className="dark:text-gray-300 font-medium">Enable Member</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700">
                        <p>If unchecked, this member will not have access until enabled.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
              </div>

            </div>
            <DialogFooter className="gap-2 sm:flex-row sm:justify-between">
              <div>
                {!isEditing && onPreviewInvitation && (
                  <Button variant="outline" onClick={handlePreviewClick} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                    <Eye className="mr-2 h-4 w-4" /> Preview Invitation
                  </Button>
                )}
              </div>
              <div className="flex gap-2 flex-col-reverse sm:flex-row">
                <DialogClose asChild>
                  <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700 w-full sm:w-auto">Cancel</Button>
                </DialogClose>
                <Button 
                  type="button" 
                  onClick={handleInternalSubmit} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                  disabled={(formData.immediateAccess && formData.passcodeType === 'custom' && !!passcodeError) || !formData.roleId}
                >
                  {getSubmitButtonText()}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default InviteMemberDialog;