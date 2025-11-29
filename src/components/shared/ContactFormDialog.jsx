import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Info, PlusCircle, X } from 'lucide-react';
    import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
    import { Badge } from '@/components/ui/badge';
    
    const predefinedTags = {
        '🍽️ Food & Restaurants': ['Pizza', 'Burger', 'Sandwich', 'Persian Food', 'Fast Food', 'Coffee Shop', 'Vegan', 'Bakery', 'Ice Cream'],
        '🧰 Home Services': ['Plumber', 'Electrician', 'Painter', 'Cleaner', 'Carpenter', 'Locksmith', 'Handyman', 'HVAC', 'Appliance Repair'],
        '👶 Family & Childcare': ['Babysitter', 'Nanny', 'Tutor', 'Pediatrician', 'Daycare'],
        '🚗 Transport & Vehicles': ['Taxi', 'Uber', 'Car Rental', 'Mechanic', 'Towing'],
        '🧘 Health & Wellness': ['Dentist', 'Family Doctor', 'Psychologist', 'Physiotherapist', 'Gym', 'Yoga', 'Massage'],
        '🛍️ Shopping & Errands': ['Grocery', 'Supermarket', 'Tailor', 'Shoe Repair', 'Dry Cleaning', 'Hairdresser', 'Barber', 'Beauty Salon'],
        '🎓 Education & Support': ['Language Tutor', 'Math Tutor', 'Music Teacher', 'IT Support', 'Tech Repair'],
        '🐶 Pets': ['Veterinarian', 'Pet Grooming', 'Pet Walking']
    };
    const allPredefinedTags = Object.values(predefinedTags).flat();

    const ContactFormDialog = ({ isOpen, onOpenChange, contactData, onInputChange, onTagsChange, onSubmit, isEditing }) => {
      const [showOptional, setShowOptional] = useState(false);
      const [tagInput, setTagInput] = useState('');
      const [openTagPopover, setOpenTagPopover] = useState(false);
      
      const handleTagSelect = (currentValue) => {
        if (!currentValue) return;
        const newTags = [...contactData.tags];
        if (!newTags.includes(currentValue)) {
            newTags.push(currentValue);
        }
        onTagsChange(newTags);
        setTagInput('');
        setOpenTagPopover(false);
      };

      const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            handleTagSelect(tagInput.trim());
        }
      };

      const handleRemoveTag = (tagToRemove) => {
        onTagsChange(contactData.tags.filter(tag => tag !== tagToRemove));
      };
      
      const filteredTags = allPredefinedTags.filter(tag => 
        !contactData.tags.includes(tag) && tag.toLowerCase().includes(tagInput.toLowerCase())
      );

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-2xl dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{isEditing ? 'Edit Service / Contact' : 'Add New Service / Contact'}</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                {isEditing ? 'Update the details for this contact.' : 'Share a service or contact with the community.'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
              <form className="grid gap-4 py-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="dark:text-gray-300">First Name / Service Name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" name="firstName" value={contactData.firstName || ''} onChange={onInputChange} placeholder="e.g., John or 'Reliable Plumbing'" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="dark:text-gray-300">Last Name / Type</Label>
                    <Input id="lastName" name="lastName" value={contactData.lastName || ''} onChange={onInputChange} placeholder="e.g., Smith or 'Inc.'" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="dark:text-gray-300">Tags</Label>
                    <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700">
                        <p>Type and press Enter to add a custom tag, or select from the list.</p>
                      </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                  </div>
                   <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
                        <PopoverTrigger asChild>
                            <Input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder="Search or add tags..."
                                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 flex-grow"
                            />
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search tags..." />
                                <CommandList>
                                <CommandEmpty>No results. Press Enter to add "{tagInput}".</CommandEmpty>
                                <CommandGroup>
                                    {filteredTags.map((tag) => (
                                    <CommandItem
                                        key={tag}
                                        value={tag}
                                        onSelect={handleTagSelect}
                                    >
                                        {tag}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(contactData.tags || []).map(tag => (
                      <Badge key={tag} variant="secondary" className="dark:bg-slate-600 dark:text-gray-200">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 focus:outline-none">
                          <X className="h-3 w-3"/>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-2">
                    <div className="flex items-center gap-2">
                        <Label>Visibility</Label>
                        <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700">
                            <p>Control who can view this contact: only you, your household members, or all residents.</p>
                        </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </div>
                    <RadioGroup
                        name="visibility"
                        value={contactData.visibility}
                        onValueChange={(value) => onInputChange({ target: { name: 'visibility', value } })}
                        className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 pt-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="me" id="vis-me" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="vis-me" className="dark:text-gray-300">Visible only to me</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unit" id="vis-unit" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="vis-unit" className="dark:text-gray-300">Share with unit members</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="vis-public" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                            <Label htmlFor="vis-public" className="dark:text-gray-300">Make public to all residents</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                <div className="mt-2">
                  <Button variant="link" className="p-0 h-auto text-primary dark:text-blue-400" onClick={() => setShowOptional(!showOptional)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {showOptional ? 'Hide' : 'Show'} Optional Details
                  </Button>
                </div>

                {showOptional && (
                  <div className="space-y-4 pt-2 border-t dark:border-slate-700">
                    <h4 className="text-md font-semibold dark:text-gray-200">Optional Contact Info</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryPhoneNumber" className="dark:text-gray-300">Phone Number</Label>
                        <Input id="primaryPhoneNumber" name="primaryPhoneNumber" type="tel" value={contactData.primaryPhoneNumber || ''} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                      </div>
                      <div>
                        <Label htmlFor="emailPrimary" className="dark:text-gray-300">Email</Label>
                        <Input id="emailPrimary" name="emailPrimary" type="email" value={contactData.emailPrimary || ''} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                      </div>
                    </div>
                     <div>
                        <Label htmlFor="website" className="dark:text-gray-300">Website</Label>
                        <Input id="website" name="website" type="url" value={contactData.website || ''} onChange={onInputChange} placeholder="https://example.com" className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                     </div>
                    <div>
                      <Label htmlFor="addressStreet" className="dark:text-gray-300">Address</Label>
                      <Input id="addressStreet" name="addressStreet" value={contactData.addressStreet || ''} onChange={onInputChange} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                    </div>
                  </div>
                )}
              </form>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t dark:border-slate-700">
              <DialogClose asChild>
                <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
              </DialogClose>
              <Button onClick={onSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isEditing ? 'Save Changes' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ContactFormDialog;