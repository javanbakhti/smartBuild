import React from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { QrCode } from 'lucide-react';
    import ResidentVisitorForm from '@/components/resident/visitors/ResidentVisitorForm';

    const defaultFormState = {
      accessType: 'single', expirationType: 'relative', expirationDays: '1', expirationHours: '0',
      absoluteExpirationDate: '', absoluteExpirationTime: '', usageLimit: '', entryCount: 0, status: 'expected',
      name: '', expectedDate: '', expectedTime: '', 
      companyName: '', supervisorName: '', supervisorContact: '', visitorEmail: '', visitorPhone: '', comment: ''
    };

    const ResidentVisitorDialogs = ({
      isFormDialogOpen,
      setIsFormDialogOpen,
      editingVisitor,
      setEditingVisitor,
      formData,
      setFormData,
      handleInputChange,
      handleSubmit,
      unitNumber,
      isPasscodeDialogOpen,
      setIsPasscodeDialogOpen,
      generatedPasscodeInfo,
    }) => {
      return (
        <>
          <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
            setIsFormDialogOpen(isOpen);
            if (!isOpen) {
              setEditingVisitor(null);
              setFormData({...defaultFormState, unitNumber: unitNumber});
            }
          }}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">{editingVisitor ? 'Edit Visitor' : 'Invite New Visitor'}</DialogTitle>
                <DialogDescription>
                  {editingVisitor ? 'Update visitor details.' : `Enter visitor details for pre-authorization for your unit: ${unitNumber}.`}
                </DialogDescription>
              </DialogHeader>
              <ResidentVisitorForm
                visitorData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isEditing={!!editingVisitor}
                unitNumber={unitNumber}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPasscodeDialogOpen} onOpenChange={setIsPasscodeDialogOpen}>
            <DialogContent className="sm:max-w-md dark:bg-slate-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Visitor Passcode Generated</DialogTitle>
                {generatedPasscodeInfo && <DialogDescription>Passcode for {generatedPasscodeInfo.name} visiting unit {generatedPasscodeInfo.unit}.</DialogDescription>}
              </DialogHeader>
              {generatedPasscodeInfo && (
                <div className="py-4 space-y-3">
                  <p className="text-center text-4xl font-bold tracking-wider text-primary dark:text-purple-400">{generatedPasscodeInfo.code}</p>
                  <div className="text-sm text-muted-foreground dark:text-gray-400 text-center">
                    <p>Valid From: {generatedPasscodeInfo.validFrom}</p>
                    <p>Valid Until: {generatedPasscodeInfo.validUntil}</p>
                  </div>
                  <div className="flex justify-center pt-2">
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-500 dark:text-gray-400" />
                      <p className="sr-only">{generatedPasscodeInfo.qrData}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-500 text-center pt-2">Share this passcode and QR code with the visitor. It can be used for entry via the Kiosk.</p>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsPasscodeDialogOpen(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    };

    export default ResidentVisitorDialogs;