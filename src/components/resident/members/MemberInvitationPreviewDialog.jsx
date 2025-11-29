import React from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Mail, MessageSquare } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const MemberInvitationPreviewDialog = ({ 
        isOpen, 
        onOpenChange, 
        memberData, 
        residentName,
        unitNumber,
        onSendInvitation 
    }) => {
      const { toast } = useToast();
      if (!isOpen || !memberData) return null;
      
      const { 
        fullName, email, phoneNumber, 
        referralCode, invitationLink,
        immediateAccess, passcode 
      } = memberData;

      const inviter = residentName || "Your Resident";
      
      const generateEmailMessage = () => {
        let message = `Hello ${fullName},\n\n${inviter} has invited you to join their household (Unit ${unitNumber}) on our resident portal.`;
        if (immediateAccess && passcode) {
          message += `\n\nFor immediate access to the building, your temporary passcode is: ${passcode}`;
        }
        if (referralCode) {
          message += `\n\nYour personal invitation code is: ${referralCode}`;
        }
        if (invitationLink) {
          message += `\nPlease use the following link to create your account: ${invitationLink}`;
        }
        message += `\n\nWe look forward to having you!`;
        return message;
      };

      const generateSmsMessage = () => {
        let message = `${inviter} invited you to Unit ${unitNumber}.`;
        if (immediateAccess && passcode) {
          message += ` Your temporary passcode is: ${passcode}.`;
        }
        message += ` Invitation code: ${referralCode}.`;
        message += ` Link: (will be shortened for SMS).`;
        return message;
      };

      const handleConfirmSend = () => {
        if (onSendInvitation) {
          onSendInvitation(); 
        } else {
          toast({ title: "Member Invitation Sent (Simulated)", description: `Invitation details for ${fullName} would be sent.` });
        }
        onOpenChange(false); 
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Member Invitation Preview</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Review the invitation details for {fullName}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {immediateAccess && passcode && (
                <div>
                  <Label className="font-semibold dark:text-gray-300">Temporary Passcode:</Label>
                  <p className="mt-1 p-2 text-sm border rounded-md dark:bg-slate-700 dark:text-primary dark:border-slate-600 font-mono">{passcode}</p>
                </div>
              )}
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

              <div>
                <Label className="font-semibold dark:text-gray-300 flex items-center"><Mail className="w-4 h-4 mr-2"/>Email to: {email}</Label>
                <pre className="mt-1 p-2 text-sm border rounded-md whitespace-pre-wrap dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600">{generateEmailMessage()}</pre>
              </div>
              
              {phoneNumber && (
                <div className="mt-2">
                  <Label className="font-semibold dark:text-gray-300 flex items-center"><MessageSquare className="w-4 h-4 mr-2"/>SMS to: {phoneNumber}</Label>
                  <pre className="mt-1 p-2 text-sm border rounded-md whitespace-pre-wrap dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600">
                    {generateSmsMessage()}
                  </pre>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="primary" onClick={handleConfirmSend} className="w-full sm:w-auto">Send Invitation</Button>
              <DialogClose asChild><Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700 w-full sm:w-auto">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default MemberInvitationPreviewDialog;