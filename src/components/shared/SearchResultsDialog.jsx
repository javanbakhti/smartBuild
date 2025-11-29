import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Button } from '@/components/ui/button';
    import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
    import { DoorOpen, User, Users, Tv2, Settings, FileText, MessageSquare, Building, Link as LinkIcon, Loader2, Search as SearchIconLucide } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import { useLanguage } from '@/contexts/LanguageContext';

    const getIconForType = (type) => {
      switch (type) {
        case 'Door': return <DoorOpen className="h-5 w-5 text-blue-500" />;
        case 'Resident': return <User className="h-5 w-5 text-green-500" />;
        case 'Manager Visitor':
        case 'My Visitor': return <Users className="h-5 w-5 text-purple-500" />;
        case 'My Member': return <Users className="h-5 w-5 text-indigo-500" />;
        case 'Page': return <LinkIcon className="h-5 w-5 text-gray-500" />;
        default: return <FileText className="h-5 w-5 text-gray-400" />;
      }
    };

    const SearchResultsDialog = () => {
      const { 
        isSearchResultsOpen, 
        closeSearchResults, 
        searchResults, 
        isLoadingSearch,
        searchTerm 
      } = useGlobalSearch();
      const navigate = useNavigate();
      const { t } = useLanguage();

      const handleResultClick = (result) => {
        if (result.action) {
          result.action();
        } else if (result.path) {
          navigate(result.path);
        }
        closeSearchResults();
      };

      return (
        <Dialog open={isSearchResultsOpen} onOpenChange={closeSearchResults}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col dark:bg-slate-900 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {t('searchResultsTitle') || 'Search Results'}
                {searchTerm && <span className="text-muted-foreground text-sm"> for "{searchTerm}"</span>}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                {isLoadingSearch 
                    ? (t('searchingInProgress') || 'Searching...') 
                    : searchResults.length > 0 
                        ? `${t('foundNResults', { count: searchResults.length }) || `Found ${searchResults.length} result(s).`}`
                        : (t('noResultsFound') || 'No results found for your query.')
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow overflow-hidden">
              <ScrollArea className="h-full pr-1">
                {isLoadingSearch ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 dark:text-gray-300">{t('loadingResults') || 'Loading results...'}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="space-y-2 py-2">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto py-3 px-3 text-left dark:hover:bg-slate-800"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 pt-0.5">{getIconForType(result.type)}</div>
                            <div>
                              <p className="font-semibold text-sm dark:text-white">{result.name}</p>
                              <p className="text-xs text-muted-foreground dark:text-gray-400">{result.description}</p>
                            </div>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !isLoadingSearch && searchTerm && (
                    <div className="text-center py-10 text-muted-foreground dark:text-gray-500">
                      <SearchIconLucide className="h-12 w-12 mx-auto mb-2" />
                      <p>{t('noResultsForTerm', { term: searchTerm }) || `No results found for "${searchTerm}". Try a different query.`}</p>
                    </div>
                  )
                )}
              </ScrollArea>
            </div>
            
            <div className="pt-4 border-t dark:border-slate-700">
              <Button onClick={closeSearchResults} variant="outline" className="w-full dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                {t('close') || 'Close'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    };
    
    export default SearchResultsDialog;