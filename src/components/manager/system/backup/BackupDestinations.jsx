import React from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Server, Share2, Mail, HardDrive as LocalStorageIcon, Cloud } from 'lucide-react';

    const BackupDestinations = ({ settings, setSettings }) => {
      const { toast } = useToast();

      const handleInputChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      };

      const handleDestinationDetailChange = (destType, key, value) => {
        setSettings(prev => ({
          ...prev,
          destinationDetails: {
            ...prev.destinationDetails,
            [destType]: { ...prev.destinationDetails[destType], [key]: value }
          }
        }));
      };

      const renderDestinationFields = () => {
        const currentDestDetails = settings.destinationDetails[settings.destination] || {};
        switch (settings.destination) {
          case 'localStorage': return <p className="text-sm text-muted-foreground">Backups stored in browser's local storage. Limited size.</p>;
          case 'ftp':
          case 'sftp':
            return (
              <div className="space-y-4">
                <Input placeholder="Host Address" value={currentDestDetails.host || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'host', e.target.value)} />
                <Input placeholder="Port" type="number" value={currentDestDetails.port || (settings.destination === 'ftp' ? '21' : '22')} onChange={e => handleDestinationDetailChange(settings.destination, 'port', e.target.value)} />
                <Input placeholder="Username" value={currentDestDetails.user || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'user', e.target.value)} />
                <Input placeholder="Password" type="password" value={currentDestDetails.pass || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'pass', e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => toast({title: "Test Connection", description:"Simulating test... Connection successful!"})}>Test Connection</Button>
              </div>
            );
          case 'scp':
             return (
              <div className="space-y-4">
                <Input placeholder="Host Address" value={currentDestDetails.host || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'host', e.target.value)} />
                <Input placeholder="Port" type="number" value={currentDestDetails.port || '22'} onChange={e => handleDestinationDetailChange(settings.destination, 'port', e.target.value)} />
                <Input placeholder="Username" value={currentDestDetails.user || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'user', e.target.value)} />
                <Input placeholder="Password/Key Path" type="password" value={currentDestDetails.pass || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'pass', e.target.value)} />
                <Input placeholder="Remote Path" value={currentDestDetails.path || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'path', e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => toast({title: "Test Connection", description:"Simulating test... Connection successful!"})}>Test Connection</Button>
              </div>
            );
          case 'fileSharing':
            return (
              <div className="space-y-4">
                <Input placeholder="Network Path (e.g., //server/share or /mnt/nfs)" value={currentDestDetails.path || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'path', e.target.value)} />
                <Input placeholder="Username (optional)" value={currentDestDetails.user || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'user', e.target.value)} />
                <Input placeholder="Password (optional)" type="password" value={currentDestDetails.pass || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'pass', e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => toast({title: "Test Connection", description:"Simulating test... Connection successful!"})}>Test Connection</Button>
              </div>
            );
          case 'googleDrive':
          case 'dropbox':
            return (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Connect your {settings.destination === 'googleDrive' ? 'Google Drive' : 'Dropbox'} account.</p>
                <Button variant="outline" onClick={() => toast({title: "Connect Account", description:`Simulating connection to ${settings.destination}...`})}>Connect to {settings.destination === 'googleDrive' ? 'Google Drive' : 'Dropbox'}</Button>
              </div>
            );
          case 'email':
            return (
              <div className="space-y-4">
                <Input placeholder="Recipient Email Address" type="email" value={currentDestDetails.address || ''} onChange={e => handleDestinationDetailChange(settings.destination, 'address', e.target.value)} />
                <Input placeholder="Email Subject Prefix" value={currentDestDetails.subjectPrefix || '[Backup]'} onChange={e => handleDestinationDetailChange(settings.destination, 'subjectPrefix', e.target.value)} />
                <p className="text-xs text-muted-foreground">Note: For configuration-only backups under 5MB.</p>
                <Button variant="outline" size="sm" onClick={() => toast({title: "Test Email", description:"Simulating test email... Sent!"})}>Send Test Email</Button>
              </div>
            );
          default: return null;
        }
      };

      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center"><Server className="mr-2 h-5 w-5"/>Backup Destinations</CardTitle>
            <CardDescription>Choose where your backups are stored.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={settings.destination} onValueChange={value => handleInputChange('destination', value)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 mb-4">
                <TabsTrigger value="localStorage"><LocalStorageIcon className="h-4 w-4 mr-1 md:mr-2"/>Local</TabsTrigger>
                <TabsTrigger value="ftp">FTP</TabsTrigger>
                <TabsTrigger value="sftp">SFTP</TabsTrigger>
                <TabsTrigger value="scp">SCP</TabsTrigger>
                <TabsTrigger value="fileSharing"><Share2 className="h-4 w-4 mr-1 md:mr-2"/>Share</TabsTrigger>
                <TabsTrigger value="googleDrive"><Cloud className="h-4 w-4 mr-1 md:mr-2"/>Drive</TabsTrigger>
                <TabsTrigger value="dropbox"><Cloud className="h-4 w-4 mr-1 md:mr-2"/>Dropbox</TabsTrigger>
                <TabsTrigger value="email"><Mail className="h-4 w-4 mr-1 md:mr-2"/>Email</TabsTrigger>
              </TabsList>
              <TabsContent value="localStorage">{renderDestinationFields()}</TabsContent>
              <TabsContent value="ftp">{renderDestinationFields()}</TabsContent>
              <TabsContent value="sftp">{renderDestinationFields()}</TabsContent>
              <TabsContent value="scp">{renderDestinationFields()}</TabsContent>
              <TabsContent value="fileSharing">{renderDestinationFields()}</TabsContent>
              <TabsContent value="googleDrive">{renderDestinationFields()}</TabsContent>
              <TabsContent value="dropbox">{renderDestinationFields()}</TabsContent>
              <TabsContent value="email">{renderDestinationFields()}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      );
    };

    export default BackupDestinations;