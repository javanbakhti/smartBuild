import React, { useState, useMemo } from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { MoreHorizontal, Edit, Trash2, Flag, Star, ChevronRight, Phone, Send, Globe, MapPin, ThumbsUp, Heart } from 'lucide-react';
    import { Checkbox } from '@/components/ui/checkbox';
    import { motion } from 'framer-motion';
    import { Textarea } from '@/components/ui/textarea';
    import ReportContactDialog from './ReportContactDialog';
    import { cn } from '@/lib/utils';
    import { Label } from '@/components/ui/label';

    const StarRating = ({ rating, onRate, isReadonly = false, size = 'h-4 w-4' }) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        `cursor-pointer transition-colors ${size}`,
                        rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600',
                        !isReadonly ? 'hover:text-yellow-300' : ''
                    )}
                    onClick={() => !isReadonly && onRate(star)}
                />
            ))}
        </div>
    );

    const ContactRowDetails = ({ contact, currentUser, onUpdate, onReport }) => {
        const [newComment, setNewComment] = useState('');
        const hasUsedService = contact.usedBy?.includes(currentUser?.id);

        const handleToggleUsedService = () => {
            const updatedUsedBy = hasUsedService
                ? contact.usedBy.filter(id => id !== currentUser.id)
                : [...(contact.usedBy || []), currentUser.id];
            onUpdate({ ...contact, usedBy: updatedUsedBy });
        };

        const handleRate = (rating) => {
            const existingRatingIndex = contact.ratings?.findIndex(r => r.userId === currentUser.id) ?? -1;
            let updatedRatings;
            if (existingRatingIndex > -1) {
                updatedRatings = [...contact.ratings];
                updatedRatings[existingRatingIndex] = { userId: currentUser.id, rating };
            } else {
                updatedRatings = [...(contact.ratings || []), { userId: currentUser.id, rating }];
            }
            onUpdate({ ...contact, ratings: updatedRatings });
        };
        
        const handleAddComment = (e) => {
            e.preventDefault();
            if (!newComment.trim()) return;
            const comment = {
                id: `comment_${Date.now()}`,
                userId: currentUser.id,
                userName: currentUser.fullName,
                comment: newComment,
                reactions: {},
                timestamp: new Date().toISOString(),
            };
            const updatedComments = [...(contact.comments || []), comment];
            onUpdate({ ...contact, comments: updatedComments });
            setNewComment('');
        };

        const handleReaction = (commentId, reaction) => {
            const updatedComments = contact.comments.map(c => {
                if (c.id === commentId) {
                    const newReactions = { ...(c.reactions || {}) };
                    if (!newReactions[reaction]) newReactions[reaction] = [];
                    const userIndex = newReactions[reaction].indexOf(currentUser.id);
                    if (userIndex > -1) {
                        newReactions[reaction].splice(userIndex, 1);
                    } else {
                        newReactions[reaction].push(currentUser.id);
                    }
                    return { ...c, reactions: newReactions };
                }
                return c;
            });
            onUpdate({ ...contact, comments: updatedComments });
        };

        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.addressStreet)}`;

        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 dark:bg-slate-800/50 p-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2 dark:text-gray-200">Contact Details</h4>
                        <div className="space-y-2 text-sm">
                            {contact.primaryPhoneNumber && <div className="flex items-center"><Phone className="h-4 w-4 mr-2 text-primary" /><a href={`tel:${contact.primaryPhoneNumber}`} className="hover:underline">{contact.primaryPhoneNumber}</a></div>}
                            {contact.emailPrimary && <div className="flex items-center"><Send className="h-4 w-4 mr-2 text-primary" /><a href={`mailto:${contact.emailPrimary}`} className="hover:underline truncate">{contact.emailPrimary}</a></div>}
                            {contact.website && <div className="flex items-center"><Globe className="h-4 w-4 mr-2 text-primary" /><a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{contact.website}</a></div>}
                            {contact.addressStreet && <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /><a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{contact.addressStreet}</a></div>}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 dark:text-gray-200">Reviews & Rating</h4>
                        <div className="space-y-4">
                            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                {contact.comments?.length > 0 ? contact.comments.map(c => (
                                <div key={c.id} className="text-sm bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                                    <p className="font-semibold dark:text-white">{c.userName}</p>
                                    <p className="dark:text-slate-300">{c.comment}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                                        <button onClick={() => handleReaction(c.id, '👍')} className={`flex items-center gap-1 hover:text-primary ${c.reactions?.['👍']?.includes(currentUser.id) ? 'text-primary' : ''}`}>
                                            <ThumbsUp className="h-3.5 w-3.5" /> {c.reactions?.['👍']?.length || 0}
                                        </button>
                                        <button onClick={() => handleReaction(c.id, '❤️')} className={`flex items-center gap-1 hover:text-red-500 ${c.reactions?.['❤️']?.includes(currentUser.id) ? 'text-red-500' : ''}`}>
                                            <Heart className="h-3.5 w-3.5" /> {c.reactions?.['❤️']?.length || 0}
                                        </button>
                                    </div>
                                </div>
                                )) : <p className="text-sm text-center text-muted-foreground">No reviews yet.</p>}
                            </div>
                             <div className="space-y-2">
                                <h5 className="font-semibold text-sm">Your Rating & Review</h5>
                                <StarRating rating={contact.ratings?.find(r=>r.userId === currentUser.id)?.rating || 0} onRate={handleRate} />
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your experience..." rows={1} className="text-sm dark:bg-slate-700"/>
                                <Button type="submit" size="sm">Post</Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-end">
                    <div className="flex items-center space-x-2">
                        <Checkbox id={`list-used-${contact.id}`} checked={hasUsedService} onCheckedChange={handleToggleUsedService} />
                        <Label htmlFor={`list-used-${contact.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I used this service
                        </Label>
                        {contact.usedBy?.length > 0 && <Badge variant="outline" className="dark:border-green-500/50 dark:text-green-400">{contact.usedBy.length} used</Badge>}
                    </div>
                </div>
            </motion.div>
        );
    };


    const ContactRow = ({ contact, currentUser, onUpdate, onDelete, onReport }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

        const canEdit = currentUser?.role === 'manager' || currentUser?.role === 'admin' || contact.ownerId === currentUser?.id;
        
        const getAverageRating = (ratings) => {
            if (!ratings || ratings.length === 0) return 0;
            const total = ratings.reduce((sum, r) => sum + r.rating, 0);
            return (total / ratings.length);
        };
        const avgRating = getAverageRating(contact.ratings);

        const handleReportSubmit = (reason) => {
            onReport(contact.id, reason);
            setIsReportDialogOpen(false);
        };

        return (
            <>
                <TableRow 
                    key={contact.id} 
                    className="dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    data-state={isExpanded ? "selected" : ""}
                >
                    <TableCell onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex items-center">
                            <ChevronRight className={cn("h-4 w-4 mr-2 transition-transform", isExpanded && "rotate-90")} />
                            <div>
                                <div className="font-medium dark:text-white">{contact.firstName} {contact.lastName}</div>
                                <div className="text-sm text-muted-foreground dark:text-gray-400">{contact.emailPrimary || contact.primaryPhoneNumber}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                            {contact.tags?.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="dark:bg-slate-700">{tag}</Badge>)}
                            {contact.tags?.length > 3 && <Badge variant="outline">+{contact.tags.length - 3}</Badge>}
                        </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex items-center gap-2">
                            <StarRating rating={avgRating} />
                            <span className="text-xs text-muted-foreground">({contact.ratings?.length || 0})</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell" onClick={() => setIsExpanded(!isExpanded)}>
                        {contact.usedBy?.length > 0 ? `${contact.usedBy.length} user(s)` : 'Not used'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                          {canEdit ? (
                            <>
                                <DropdownMenuItem onClick={() => onUpdate(contact, true)} className="dark:focus:bg-slate-700">
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-red-600 dark:text-red-500 dark:focus:bg-red-900/50 dark:focus:text-red-400">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)} className="text-yellow-600 dark:text-yellow-500 dark:focus:bg-yellow-900/50 dark:focus:text-yellow-400">
                                <Flag className="mr-2 h-4 w-4" /> Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
                {isExpanded && (
                    <TableRow className="dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40">
                       <TableCell colSpan={5} className="p-0">
                            <ContactRowDetails
                                contact={contact}
                                currentUser={currentUser}
                                onUpdate={onUpdate}
                                onReport={onReport}
                            />
                       </TableCell>
                    </TableRow>
                )}
                 <ReportContactDialog
                    isOpen={isReportDialogOpen}
                    onOpenChange={setIsReportDialogOpen}
                    contactName={`${contact.firstName} ${contact.lastName || ''}`}
                    onSubmit={handleReportSubmit}
                />
            </>
        );
    };

    const ContactList = ({ contacts, currentUser, onUpdate, onDelete, onReport }) => {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto bg-background dark:bg-slate-800 rounded-lg shadow"
        >
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <TableHead className="w-[35%] dark:text-gray-300">Name</TableHead>
                <TableHead className="hidden md:table-cell dark:text-gray-300">Tags</TableHead>
                <TableHead className="hidden lg:table-cell dark:text-gray-300">Rating</TableHead>
                <TableHead className="hidden lg:table-cell dark:text-gray-300">Used By</TableHead>
                <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <ContactRow 
                    key={contact.id}
                    contact={contact}
                    currentUser={currentUser}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onReport={onReport}
                />
              ))}
            </TableBody>
          </Table>
        </motion.div>
      );
    };

    export default ContactList;