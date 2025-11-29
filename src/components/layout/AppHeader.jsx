import React, { useState, useRef, useEffect } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Building, Sun, Moon, Bell, Menu, Globe, Search, X, Loader2, User as UserIcon, LogOut, Settings, PanelLeftClose, PanelLeftOpen, Check } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useToast } from '@/components/ui/use-toast';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      DropdownMenuSeparator,
      DropdownMenuLabel,
      DropdownMenuSub,
      DropdownMenuSubContent,
      DropdownMenuSubTrigger,
      DropdownMenuPortal
    } from "@/components/ui/dropdown-menu";
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

    const AppHeader = ({ darkMode, toggleDarkMode, role, hasUnreadMessages, onToggleMobileSidebar, user, onLogout, isSidebarCollapsed, toggleSidebarCollapse, isDesktop }) => {
      const navigate = useNavigate();
      const { language, setLanguage, t } = useLanguage();
      const { toast } = useToast();
      const { 
        performSearch, 
        isLoadingSearch: isGlobalLoadingSearch, 
        setSearchTermState: setGlobalSearchTerm,
        closeSearchResults,
        isSearchResultsOpen: isGlobalSearchResultsOpen
      } = useGlobalSearch();
      
      const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
      const [localSearchTerm, setLocalSearchTerm] = useState('');
      const searchInputRef = useRef(null);

      const onNavigateToMessages = () => {
        navigate(role === 'manager' || role === 'admin' ? '/manager/messages' : '/resident/messages');
      };

      const handleToggleSearchInput = () => {
        const newVisibilityState = !isSearchInputVisible;
        setIsSearchInputVisible(newVisibilityState);
        if (!newVisibilityState) { // If closing search input
          setLocalSearchTerm(''); 
          setGlobalSearchTerm(''); // Clear global search term
          if(isGlobalSearchResultsOpen) closeSearchResults(); // Close results dialog if open
        }
      };
      
      useEffect(() => {
        if (isSearchInputVisible && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, [isSearchInputVisible]);

      const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!localSearchTerm.trim()) {
          toast({
            title: t('search'),
            description: t('searchPlaceholder'),
            variant: "destructive"
          });
          return;
        }
        performSearch(localSearchTerm);
      };
      
      const handleLocalSearchTermChange = (e) => {
        setLocalSearchTerm(e.target.value);
      };

      const languages = [
        { code: 'en', name: t('languageEN') || 'English' },
        { code: 'ar', name: t('languageAR') || 'العربية' },
        { code: 'es', name: t('languageES') || 'Español' },
        { code: 'fa', name: t('languageFA') || 'فارسی' },
      ];

      const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      const profilePath = role === 'manager' || role === 'admin' || role === 'resident'
        ? `/${role}/profile`
        : '/';

      return (
        <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              {isDesktop ? (
                <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} className="mr-2" aria-label="Toggle sidebar collapse">
                  {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>
              ) : (
                (role === 'manager' || role === 'admin' || role === 'resident') && (
                  <Button variant="ghost" size="icon" onClick={onToggleMobileSidebar} className="mr-2" aria-label={t('toggleSidebar') || "Toggle sidebar"}>
                    <Menu className="h-6 w-6" />
                  </Button>
                )
              )}
              <Link to={role === 'manager' || role === 'admin' ? '/manager/dashboard' : (role === 'resident' ? '/resident/dashboard' : '/')} className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                <Building className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight hidden sm:inline">{t('smartIntercom')}</span>
              </Link>
            </div>

            <div className="flex-1 flex justify-center px-4">
              <AnimatePresence>
                {isSearchInputVisible && (
                  <motion.form 
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 0, opacity: 0, x: 50 }}
                    animate={{ width: '100%', opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-sm md:max-w-md hidden md:flex items-center relative"
                  >
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder={t('searchPlaceholder') || "Search..."}
                      value={localSearchTerm}
                      onChange={handleLocalSearchTermChange}
                      className="w-full pr-10"
                    />
                     <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 text-muted-foreground hover:text-foreground" disabled={isGlobalLoadingSearch}>
                       {isGlobalLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                     </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={handleToggleSearchInput} aria-label={t('search') || "Search"}>
                  {isSearchInputVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>
              </div>

              <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
                 <Button variant="ghost" size="icon" onClick={handleToggleSearchInput} aria-label={t('search') || "Search"}>
                    {isSearchInputVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </Button>
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label={t('toggleDarkMode') || "Toggle dark mode"}>
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                
                {(role === 'manager' || role === 'admin' || role === 'resident') && (
                  <>
                    <Button variant="ghost" size="icon" onClick={onNavigateToMessages} aria-label={t('notifications') || "Notifications"} className="relative">
                      <Bell className="h-5 w-5" />
                      {hasUnreadMessages && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"></span>
                      )}
                    </Button>
                  </>
                )}
              </div>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate(profilePath)}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>{t('profile') || 'Profile'}</span>
                    </DropdownMenuItem>
                     <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Globe className="mr-2 h-4 w-4" />
                        <span>{t('language') || 'Language'}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                           {languages.map((lang) => (
                            <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)}>
                              <div className="flex items-center justify-between w-full">
                                <span>{lang.name}</span>
                                {language === lang.code && <Check className="h-4 w-4 ml-2" />}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem onSelect={() => navigate(role === 'manager' || role === 'admin' ? '/manager/settings/general' : '/resident/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('settings') || 'Settings'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={onLogout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('logout') || 'Log out'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

             <AnimatePresence>
              {isSearchInputVisible && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2 shadow-md z-40"
                >
                  <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                    <Input
                      ref={!searchInputRef.current ? searchInputRef : null} 
                      type="search"
                      placeholder={t('searchPlaceholder') || "Search..."}
                      value={localSearchTerm}
                      onChange={handleLocalSearchTermChange}
                      className="flex-1 pr-10"
                    />
                    <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-full px-3 text-muted-foreground hover:text-foreground" disabled={isGlobalLoadingSearch}>
                      {isGlobalLoadingSearch ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
      );
    };

    export default AppHeader;