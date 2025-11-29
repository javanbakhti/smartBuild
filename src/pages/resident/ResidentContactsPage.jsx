import React, { useState } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { PlusCircle, Search, BookUser, Loader2, LayoutGrid, List } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useContactsManagement } from '@/hooks/useContactsManagement';
    import ContactFormDialog from '@/components/shared/ContactFormDialog';
    import ContactCard from '@/components/shared/ContactCard';
    import ContactList from '@/components/shared/ContactList';

    const ResidentContactsPage = () => {
      const {
        contacts, isLoading, isFormOpen, setIsFormOpen, editingContact,
        contactFormData, openFormDialog, handleSubmit, handleDelete, handleInputChange, handleTagsChange,
        handleContactUpdate, handleReportContact,
        searchTerm, setSearchTerm, sortConfig, requestSort,
        currentUser
      } = useContactsManagement();
      
      const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

      const handleContactUpdateInternal = (updatedContact, isEditRequest = false) => {
          if (isEditRequest) {
             openFormDialog(updatedContact);
          } else {
             handleContactUpdate(updatedContact);
          }
      };

      if (!currentUser && !isLoading) {
         return (
          <Layout role="resident">
             <div className="flex items-center justify-center h-full p-4 md:p-6 lg:p-8">
              <p className="text-xl text-muted-foreground">Could not load user information. Please log in again.</p>
            </div>
          </Layout>
        );
      }
      
      return (
        <Layout role="resident">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 p-4 md:p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <BookUser className="mr-3 h-8 w-8 text-primary" /> Community Contacts
                </h1>
                <p className="text-muted-foreground">Discover and share trusted services with your neighbors.</p>
              </div>
              <Button onClick={() => openFormDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Contact
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, tag, or comment..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full dark:bg-slate-800"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={sortConfig.key} onValueChange={(value) => requestSort(value)}>
                        <SelectTrigger className="w-full md:w-[180px] dark:bg-slate-800">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800">
                            <SelectItem value="recently_added">Recently Added</SelectItem>
                            <SelectItem value="highest_rated">Highest Rated</SelectItem>
                            <SelectItem value="most_shared">Most Used</SelectItem>
                            <SelectItem value="lastName">Alphabetical</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center rounded-md bg-slate-200 dark:bg-slate-700 p-1">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-full px-2">
                            <LayoutGrid className="h-5 w-5"/>
                        </Button>
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-full px-2">
                            <List className="h-5 w-5"/>
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contacts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <BookUser className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"/>
                    <p className="text-lg font-semibold">No contacts found.</p>
                    <p>Be the first to share a trusted service with your community!</p>
                </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact) => (
                     <ContactCard 
                        key={contact.id} 
                        contact={contact} 
                        currentUser={currentUser} 
                        onUpdate={handleContactUpdateInternal}
                        onDelete={handleDelete}
                        onReport={handleReportContact}
                    />
                ))}
              </div>
            ) : (
                <ContactList
                    contacts={contacts}
                    currentUser={currentUser}
                    onUpdate={handleContactUpdateInternal}
                    onDelete={handleDelete}
                    onReport={handleReportContact}
                />
            )}

            {isFormOpen && (
              <ContactFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                contactData={contactFormData}
                onInputChange={handleInputChange}
                onTagsChange={handleTagsChange}
                onSubmit={handleSubmit}
                isEditing={!!editingContact}
              />
            )}
          </motion.div>
        </Layout>
      );
    };

    export default ResidentContactsPage;