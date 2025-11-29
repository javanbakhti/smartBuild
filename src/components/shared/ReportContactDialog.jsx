import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Flag } from 'lucide-react';

    const ReportContactDialog = ({ isOpen, onOpenChange, contactName, onSubmit }) => {
        const [reason, setReason] = useState('');

        const handleSubmit = () => {
            if (reason.trim()) {
                onSubmit(reason);
            }
        };

        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white flex items-center gap-2">
                            <Flag className="h-5 w-5 text-yellow-500" /> Report Contact
                        </DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            You are reporting "{contactName}". Please provide a reason. This will be sent to the building manager.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="report-reason" className="dark:text-gray-300">
                            Reason for reporting (e.g., incorrect info, spam, inappropriate)
                        </Label>
                        <Textarea
                            id="report-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a brief description of the issue..."
                            className="mt-2 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSubmit} disabled={!reason.trim()} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                            Submit Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default ReportContactDialog;