import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

const KioskDisplaySettings = ({ kioskDisplayName, setKioskDisplayName, defaultFullName }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Kiosk Display Preferences</CardTitle>
            <CardDescription>Control how your information appears on the entrance Kiosk.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kiosk-display-name">Display Name for Kiosk</Label>
          <Input
            id="kiosk-display-name"
            value={kioskDisplayName}
            onChange={(e) => setKioskDisplayName(e.target.value)}
            placeholder={defaultFullName}
          />
          <p className="text-sm text-muted-foreground">
            This name will be shown in the Kiosk directory. Defaults to your full name.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KioskDisplaySettings;