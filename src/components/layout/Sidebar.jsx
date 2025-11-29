import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import AccordionMenu from './AccordionMenu';
    import { X } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

    const Sidebar = ({ navItems, isMobileOpen, isCollapsed, onCloseMobile, onLogoutClick, isDesktop }) => {
      const location = useLocation();
      const isActive = (path) => location.pathname === path || (path !== '/manager/dashboard' && location.pathname.startsWith(path));

      const handleLinkClick = (item) => {
        if (item.action === 'logout' && onLogoutClick) {
          onLogoutClick();
        }
        if (isMobileOpen && onCloseMobile) { 
          onCloseMobile();
        }
      };

      const mobileSidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: "-100%", opacity: 0 },
      };

      const navItemVariants = {
        expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
        collapsed: { opacity: 0, x: -10, transition: { duration: 0.1 } },
      };

      const renderNavItem = (item, index, isMobileView = false) => {
        if (item.condition === false) return null;

        const shouldBeCollapsed = !isMobileView && isCollapsed;

        const commonClasses = `flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all group overflow-hidden whitespace-nowrap`;
        const activeClasses = 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground';
        const inactiveClasses = 'text-muted-foreground hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10';

        if (item.type === 'link') {
          const content = (
            <>
              {React.cloneElement(item.icon, { className: 'h-5 w-5 flex-shrink-0' })}
              {!shouldBeCollapsed && (
                <motion.span
                  className="ml-3"
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={navItemVariants}
                >
                  {item.text}
                </motion.span>
              )}
            </>
          );

          return (
            <Tooltip key={item.id || item.text + index} disableHoverableContent={!shouldBeCollapsed}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  onClick={() => handleLinkClick(item)}
                  className={`${commonClasses} ${isActive(item.path) ? activeClasses : inactiveClasses} ${shouldBeCollapsed ? 'justify-center' : ''}`}
                >
                  {content}
                </Link>
              </TooltipTrigger>
              <AnimatePresence>
                {shouldBeCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.text}</p>
                  </TooltipContent>
                )}
              </AnimatePresence>
            </Tooltip>
          );
        } else if (item.type === 'accordion') {
          return (
            <AccordionMenu 
              key={item.id || item.text + index} 
              icon={item.icon} 
              text={item.text} 
              items={item.items} 
              location={location} 
              pathPrefix={item.pathPrefix} 
              onLinkClick={handleLinkClick}
              isCollapsed={shouldBeCollapsed}
            />
          );
        }
        return null;
      };

      const sidebarContent = (isMobileView = false) => (
        <div className="flex flex-col h-full">
          {isMobileView && (
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
              <span className="font-semibold text-lg">Menu</span>
              <Button variant="ghost" size="icon" onClick={onCloseMobile}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <nav className="flex-1 flex flex-col space-y-1.5 p-2 overflow-y-auto">
            {navItems.map((item, index) => renderNavItem(item, index, isMobileView))}
          </nav>
        </div>
      );
      
      const desktopSidebar = (
        <motion.aside 
          className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] bg-background dark:bg-slate-900 border-r dark:border-slate-800 z-40"
          initial={false}
          animate={{ width: isCollapsed ? '5rem' : '16rem' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {sidebarContent(false)}
        </motion.aside>
      );

      const mobileSidebar = (
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                onClick={onCloseMobile}
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileSidebarVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-40 w-64 bg-background dark:bg-slate-900 border-r dark:border-slate-800 lg:hidden h-full"
              >
                {sidebarContent(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      );

      return (
        <>
          {isDesktop ? desktopSidebar : mobileSidebar}
        </>
      );
    };

    export default Sidebar;