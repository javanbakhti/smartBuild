import React from 'react';
    import { NavLink, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { cn } from '@/lib/utils';

    const BottomNavigationItem = ({ icon: Icon, text, path, isActive }) => {
      return (
        <NavLink
          to={path}
          className={({ isActive: navIsActive }) => // Use NavLink's isActive
            cn(
              "flex flex-col items-center justify-center flex-1 p-2 transition-colors duration-200 ease-in-out",
              navIsActive ? "text-primary dark:text-purple-400" : "text-muted-foreground hover:text-primary dark:hover:text-purple-300"
            )
          }
        >
          <Icon className={`h-6 w-6 mb-0.5 ${isActive ? 'text-primary dark:text-purple-400' : ''}`} />
          <span className="text-xs font-medium">{text}</span>
        </NavLink>
      );
    };

    const BottomNavigation = ({ navItems }) => {
      const location = useLocation();

      return (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 h-16 bg-background dark:bg-slate-800 border-t border-border dark:border-slate-700 shadow-t-lg flex justify-around items-stretch z-50 lg:hidden"
        >
          {navItems.map((item) => (
            <BottomNavigationItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              path={item.path}
              isActive={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
            />
          ))}
        </motion.div>
      );
    };

    export default BottomNavigation;