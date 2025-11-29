import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

const AdminInvitationLinkDialog = ({ isOpen, onOpenChange, invitationLink }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      toast({ title: "Copied!", description: "Invitation link copied to clipboard." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Admin Invitation Link</DialogTitle>
          <DialogDescription>
            Share this link with the new administrator to complete their sign-up.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={invitationLink}
              readOnly
              className="dark:bg-slate-700 dark:text-white"
            />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminInvitationLinkDialog;