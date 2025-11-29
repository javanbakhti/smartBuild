import React from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import ResidentForm from '@/components/manager/ResidentForm';
    import ViewResidentMembersDialog from '@/components/manager/ViewResidentMembersDialog';
    import { format, parseISO } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast';

    export const InvitationPreviewDialogComponent = ({ 
        isOpen, 
        onOpenChange, 
        residentData, 
        buildingName,
        onSendInvitation,
        isSubmitting
    }) => {
      const { toast } = useToast();
      if (!isOpen || !residentData) return null;
      const { 
        fullName, email, cellphoneNumber, unitNumber, 
        invitationSendMethod, invitationExpirationDate, 
        referralCode, invitationLink 
      } = residentData;

      const expiration = invitationExpirationDate ? format(parseISO(invitationExpirationDate), 'PPP') : 'N/A';
      const building = buildingName || "our building";
      
      let baseMessage = `Hello ${fullName},\n\nYou're invited to join the resident portal for unit ${unitNumber} at ${building}.`;
      if (referralCode) {
        baseMessage += `\n\nYour personal invitation code is: ${referralCode}`;
      }
      if (invitationLink) {
        baseMessage += `\nPlease use the following link to sign up: ${invitationLink}`;
      }
      baseMessage += `\nThis invitation is valid until ${expiration}.`;
      baseMessage += `\n\nWe look forward to having you!`;

      const handleConfirmSend = () => {
        if (onSendInvitation) {
          onSendInvitation();
        } else {
          toast({ title: "Invitation Sent (Simulated)", description: `Invitation details for ${fullName} would be sent.` });
          onOpenChange(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Invitation Preview & Send</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-sm text-muted-foreground dark:text-gray-400">Review the invitation details below. Click "Send Invitation" to proceed.</p>
              
              {referralCode && (
                <div>
                  <Label className="font-semibold dark:text-gray-300">Referral Code:</Label>
                  <p className="mt-1 p-2 text-sm border rounded-md dark:bg-slate-700 dark:text-primary dark:border-slate-600 font-mono">{referralCode}</p>
                </div>
              )}
              {invitationLink && (
                 <div>
                  <Label className="font-semibold dark:text-gray-300">Invitation Link:</Label>
                  <p className="mt-1 p-2 text-sm border rounded-md dark:bg-slate-700 dark:text-blue-400 dark:border-slate-600 break-all">{invitationLink}</p>
                </div>
              )}

              {invitationSendMethod === 'email' || invitationSendMethod === 'both' ? (
                <div>
                  <Label className="font-semibold dark:text-gray-300">Email to: {email}</Label>
                  <pre className="mt-1 p-2 text-sm border rounded-md whitespace-pre-wrap dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 font-sans">{baseMessage}</pre>
                </div>
              ) : null}
              {invitationSendMethod === 'sms' || invitationSendMethod === 'both' ? (
                <div className="mt-2">
                  <Label className="font-semibold dark:text-gray-300">SMS to: {cellphoneNumber || 'N/A (No phone provided)'}</Label>
                  <pre className="mt-1 p-2 text-sm border rounded-md whitespace-pre-wrap dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 font-sans">
                    {`${fullName}, you're invited to unit ${unitNumber}. Code: ${referralCode}. Link: (will be shortened for SMS). Expires: ${expiration}.`}
                  </pre>
                </div>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button onClick={handleConfirmSend} className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
              <DialogClose asChild><Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700 w-full sm:w-auto">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export const ResidentFormDialog = ({
      isOpen,
      onOpenChange,
      residentData,
      onInputChange,
      onSubmit,
      onUnitSelection,
      isEditing,
      availableUnits,
      allUnits,
      onPreviewInvitation,
      resetForm,
      isSubmitting
    }) => {
      return (
        <Dialog open={isOpen} onOpenChange={(openStatus) => {
          onOpenChange(openStatus);
          if (!openStatus) resetForm();
        }}>
          <DialogContent className="sm:max-w-lg dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{isEditing ? 'Edit Resident Details' : 'Invite New Resident'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the details for this resident.' : 'Fill in the details to invite a new resident. You can preview the invitation before saving.'}
              </DialogDescription>
            </DialogHeader>
            <ResidentForm
              residentData={residentData}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
              onUnitSelection={onUnitSelection}
              isEditing={isEditing}
              availableUnits={availableUnits}
              allUnits={allUnits}
              onPreviewInvitation={onPreviewInvitation}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      );
    };

    export const MembersDialog = ({ isOpen, onOpenChange, resident }) => {
      return (
        <ViewResidentMembersDialog
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          resident={resident}
        />
      );
    };