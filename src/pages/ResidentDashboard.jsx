import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Home, Users, MessageSquare, FileText, Settings, CalendarDays, BellRing, DoorOpen, ExternalLink, Info } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { useLanguage } from '@/contexts/LanguageContext';

    const StatCard = ({ title, value, icon, description, link, action }) => {
      const navigate = useNavigate();
      const handleClick = () => {
        if (action) action();
        else if (link) navigate(link);
      };
      return (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Card 
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer dark:bg-slate-800 dark:border-slate-700"
            onClick={handleClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-slate-300">{title}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{value}</div>
              {description && <p className="text-xs text-muted-foreground dark:text-slate-400">{description}</p>}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    const ActionButton = ({ label, icon, action, link, soon }) => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const handleClick = () => {
        if (soon) {
          toast({ title: "🚧 Feature Coming Soon!", description: "This feature isn't implemented yet—but stay tuned! 🚀" });
          return;
        }
        if (action) action();
        else if (link) navigate(link);
      };
      return (
        <Button 
          variant="outline" 
          className="w-full justify-start text-left py-6 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={handleClick}
        >
          {icon}
          <span className="ml-3">{label}{soon && <span className="text-xs text-primary/70 dark:text-primary-foreground/70 ml-1">(Soon)</span>}</span>
        </Button>
      );
    };

    const ResidentDashboard = () => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { t } = useLanguage();
      const [currentUser, setCurrentUser] = useState(null);
      const [buildingDetails, setBuildingDetails] = useState(null);
      const [recentVisitorsCount, setRecentVisitorsCount] = useState(0);
      const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
      const [accessibleDoors, setAccessibleDoors] = useState([]);

      useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);

        if (user && user.buildingUid) {
          const details = JSON.parse(localStorage.getItem('buildingDetails'));
          setBuildingDetails(details);

          const visitors = JSON.parse(localStorage.getItem(`residentVisitors_${user.id}_${user.buildingUid}`)) || [];
          setRecentVisitorsCount(visitors.filter(v => v.status === 'expected' || v.status === 'arrived').length);
          
          const messages = JSON.parse(localStorage.getItem(`messages_${user.buildingUid}`)) || [];
          setUnreadMessagesCount(messages.filter(msg => msg.receiverId === user.id && (!msg.readBy || !msg.readBy[user.id])).length);

          const allDoors = JSON.parse(localStorage.getItem('doors')) || [];
          // Filter doors accessible to residents (this is a placeholder logic)
          // In a real system, this would be based on user's permissions or unit group associations
          setAccessibleDoors(allDoors.filter(door => door.isPublicAccess || door.accessGroups?.includes('all_residents')));
        }
      }, []);

      const handleDoorAccess = (door) => {
        toast({
          title: `Accessing ${door.name}...`,
          description: "Confirmation required. This is a simulated action.",
        });
        // Future: Implement actual door opening logic, possibly involving Supabase functions
      };

      const handleCallFrontDesk = () => {
        toast({
          title: "Calling Front Desk...",
          description: "This feature is not yet implemented.",
        });
      };
      
      const navigateToMessagesWithContacts = () => {
        navigate('/resident/messages?openContacts=true');
      };

      if (!currentUser) {
        return (
          <Layout role="resident">
            <div className="p-8 text-center">Loading resident data...</div>
          </Layout>
        );
      }

      const buildingName = buildingDetails?.name || "the Building";

      return (
        <Layout role="resident">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 space-y-6"
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                {t('welcome')}, <span className="text-primary">{currentUser.nickname || currentUser.fullName}!</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('yourDashboardForUnit', { unit: currentUser.unitNumber, building: buildingName })}
                <Button variant="link" size="sm" onClick={navigateToMessagesWithContacts} className="ml-1 p-0 h-auto text-primary dark:text-cyan-400 hover:underline">
                   ({t('buildingInformation')})
                </Button>
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard 
                title={t('myUnit')} 
                value={currentUser.unitNumber}
                icon={<Home className="h-5 w-5 text-muted-foreground dark:text-slate-400" />} 
                description={`${t('floor')}: ${currentUser.floorNumber || 'N/A'}`}
                link="/resident/settings"
              />
              <StatCard 
                title={t('recentVisitors')} 
                value={recentVisitorsCount} 
                icon={<Users className="h-5 w-5 text-muted-foreground dark:text-slate-400" />} 
                description={recentVisitorsCount > 0 ? t('activeVisitorEntries') : t('noRecentActivity')}
                link="/resident/visitors"
              />
              <StatCard 
                title={t('messages')}
                value={unreadMessagesCount}
                icon={<MessageSquare className="h-5 w-5 text-muted-foreground dark:text-slate-400" />}
                description={unreadMessagesCount > 0 ? t('newMessages', { count: unreadMessagesCount }) : t('noNewMessages')}
                link="/resident/messages"
              />
            </div>

            {accessibleDoors.length > 0 && (
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">{t('quickAccessDoors')}</CardTitle>
                  <CardDescription className="dark:text-slate-400">{t('quickAccessDoorsDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accessibleDoors.map(door => (
                    <Button 
                      key={door.id} 
                      variant="secondary" 
                      className="flex items-center justify-center py-6 text-base dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                      onClick={() => handleDoorAccess(door)}
                    >
                      <DoorOpen className="mr-3 h-5 w-5" />
                      {door.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
            
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white">{t('actions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionButton label={t('mySettings')} icon={<Settings className="h-5 w-5 text-primary" />} link="/resident/settings" />
                <ActionButton label={t('callFrontDesk')} icon={<BellRing className="h-5 w-5 text-green-500" />} action={handleCallFrontDesk} soon={true} />
                <ActionButton label={t('inviteGuest')} icon={<CalendarDays className="h-5 w-5 text-purple-500" />} link="/resident/visitors" />
              </CardContent>
            </Card>

            {buildingDetails?.publicNotice && (
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50">
                <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                    <BellRing className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-blue-700 dark:text-blue-300">{t('buildingNotice')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 dark:text-blue-300/90">{buildingDetails.publicNotice}</p>
                </CardContent>
              </Card>
            )}

          </motion.div>
        </Layout>
      );
    };

    export default ResidentDashboard;