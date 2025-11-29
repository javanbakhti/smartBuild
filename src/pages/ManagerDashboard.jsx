import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Users, UserPlus, Building, Bell, BarChart3, AlertTriangle, DoorOpen as DoorOpenIcon, CheckSquare, MailOpen, Shield } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import { useToast } from '@/components/ui/use-toast';

    const StatCard = ({ title, value, icon, color, linkTo, linkText, subValue, subText }) => (
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {React.cloneElement(icon, { className: `h-5 w-5 ${color}` })}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-white">{value}</div>
            {subValue && <p className="text-xs text-muted-foreground">{subValue} {subText}</p>}
            {linkTo && (
              <Link to={linkTo} className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 block">
                {linkText || 'View Details'} &rarr;
              </Link>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );

    const ManagerDashboard = () => {
      const { toast } = useToast();
      const [buildingDetails, setBuildingDetails] = useState({});
      const [residents, setResidents] = useState([]);
      const [visitors, setVisitors] = useState([]);
      const [doors, setDoors] = useState([]);

      useEffect(() => {
        setBuildingDetails(JSON.parse(localStorage.getItem('buildingDetails')) || {});
        setResidents(JSON.parse(localStorage.getItem('residents')) || []);
        setVisitors(JSON.parse(localStorage.getItem('visitors')) || []);
        setDoors(JSON.parse(localStorage.getItem('doors')) || []);
      }, []);

      const totalResidents = residents.length;
      const pendingInvites = residents.filter(r => r.status === 'invited').length;
      const signedUpResidents = residents.filter(r => r.status === 'active' || r.status === 'signed_up').length;

    const handleOpenDoor = async (door) => {
  try {
    await axiosClient.post("/dashboard/door/open", {
      doorId: door._id
    });

    toast({
      title: "Door Opened",
      description: `${door.name} is now open.`,
    });

  } catch (err) {
    toast({
      title: "Failed",
      description: "Could not open door.",
      variant: "destructive",
    });
  }
};


      return (
        <Layout role="manager">
          <div className="space-y-8 p-4 md:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 dark:text-white">Manager Dashboard</h1>
              <p className="text-md md:text-lg text-muted-foreground">
                Welcome back! Here's an overview of {buildingDetails.buildingName || "your building"}.
              </p>
            </motion.div>

            {!buildingDetails.buildingName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
                  <CardHeader className="flex flex-row items-center space-x-3">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                    <div>
                      <CardTitle className="text-yellow-700 dark:text-yellow-300">Building Setup Incomplete</CardTitle>
                      <CardDescription className="text-yellow-600 dark:text-yellow-400">
                        Please complete your building setup to unlock all features.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Link to="/manager/building-setup">Go to Building Setup</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard 
                title="Resident Overview" 
                value={totalResidents} 
                icon={<Users />} 
                color="text-blue-500" 
                linkTo="/manager/manage-residents" 
                linkText="Manage Residents"
                subValue={`${pendingInvites} Pending | ${signedUpResidents} Active`}
                subText=""
              />
              <StatCard 
                title="Floors / Units / Doors" 
                value={`${buildingDetails.floorCount || 0} / ${buildingDetails.totalUnits || 0} / ${doors.length || 0}`} 
                icon={<Building />} 
                color="text-green-500" 
                linkTo="/manager/building-setup" 
                linkText="View Configuration" 
              />
              <StatCard title="Recent Visitors (Today)" value={visitors.filter(v => new Date(v.expectedDateTime).toDateString() === new Date().toDateString()).length} icon={<Users />} color="text-purple-500" linkTo="/manager/manage-visitors" linkText="Manage Visitors" />
              <StatCard title="Open Alerts" value="0" icon={<Bell />} color="text-red-500" />
              <StatCard title="System Health" value="Good" icon={<BarChart3 />} color="text-teal-500" />
               <StatCard title="Manage Admins" value={"1 Owner"} icon={<Shield />} color="text-indigo-500" linkTo="#" linkText="View Admins (Soon)" />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Quick Access Doors</CardTitle>
                  <CardDescription>Tap to open a door. Confirmation will be required.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(doors.length > 0 ? doors : buildingDetails.doors || []).map((door) => (
                    <AlertDialog key={door.id || door.name}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex-col dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                          <DoorOpenIcon className="h-6 w-6 mb-1 text-primary" />
                          {door.name}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">Confirm Door Open</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to open the "{door.name}" door? This action will be logged.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:bg-slate-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleOpenDoor(door.name)} className="bg-primary hover:bg-primary/90">
                            Open Door
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                  {doors.length === 0 && (!buildingDetails.doors || buildingDetails.doors.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center">No doors configured. <Link to="/manager/manage-doors" className="text-primary hover:underline">Add doors now</Link>.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                  <CardDescription>Perform common tasks quickly.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                    <Link to="/manager/manage-residents">
                      <UserPlus className="mr-2 h-4 w-4" /> Invite Resident
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                    <Link to="/manager/manage-visitors">
                      <Users className="mr-2 h-4 w-4" /> Add Visitor
                    </Link>
                  </Button>
                   <Button asChild variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                    <Link to="/manager/manage-doors">
                      <DoorOpenIcon className="mr-2 h-4 w-4" /> Manage Doors
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                    <Link to="/manager/generate-reports">
                      <BarChart3 className="mr-2 h-4 w-4" /> Generate Report
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                    <Link to="/manager/building-setup">
                      <Building className="mr-2 h-4 w-4" /> Edit Building Info
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </Layout>
      );
    };

    export default ManagerDashboard;