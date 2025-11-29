import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Textarea } from '@/components/ui/textarea';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
    import { Star, MoreVertical, ThumbsUp, Heart, Edit, Trash2, Globe, Phone, MapPin, Plus, Minus, Send, Flag } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import ReportContactDialog from './ReportContactDialog';

    const StarRating = ({ rating, onRate, isReadonly = false }) => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} ${!isReadonly ? 'hover:text-yellow-300' : ''}`}
                    onClick={() => !isReadonly && onRate(star)}
                />
            ))}
        </div>
    );

    const ContactCard = ({ contact, currentUser, onUpdate, onDelete, onReport }) => {
        const [expanded, setExpanded] = useState(false);
        const [showComments, setShowComments] = useState(false);
        const [newComment, setNewComment] = useState('');
        const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

        const canEdit = currentUser?.role === 'manager' || currentUser?.role === 'admin' || contact.ownerId === currentUser?.id;
        const hasUsedService = contact.usedBy?.includes(currentUser?.id);

        const averageRating = useMemo(() => {
            if (!contact.ratings || contact.ratings.length === 0) return 0;
            const total = contact.ratings.reduce((sum, r) => sum + r.rating, 0);
            return (total / contact.ratings.length);
        }, [contact.ratings]);

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

        const handleReportSubmit = (reason) => {
            onReport(contact.id, reason);
            setIsReportDialogOpen(false);
        };

        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.addressStreet)}`;

        return (
            <>
            <motion.div layout className="bg-white dark:bg-slate-800 rounded-lg shadow-md border dark:border-slate-700 overflow-hidden">
                <CardHeader className="p-4 flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">
                           {contact.firstName} {contact.lastName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                           <StarRating rating={averageRating} isReadonly={true} />
                           <span className="text-sm text-muted-foreground">({contact.ratings?.length || 0} ratings)</span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-700">
                           {canEdit ? (
                            <>
                                <DropdownMenuItem onClick={() => onUpdate(contact, true)} className="dark:hover:bg-slate-700"><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-red-500 dark:focus:bg-red-900/50"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </>
                           ) : (
                            <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)} className="text-yellow-600 dark:text-yellow-500 dark:focus:bg-yellow-900/50 dark:focus:text-yellow-400">
                                <Flag className="mr-2 h-4 w-4" /> Report Contact
                            </DropdownMenuItem>
                           )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {contact.tags?.map(tag => <Badge key={tag} variant="secondary" className="dark:bg-slate-700 dark:text-slate-300">{tag}</Badge>)}
                    </div>
                    
                    <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 pt-2 border-t dark:border-slate-700"
                        >
                            {contact.primaryPhoneNumber && <div className="flex items-center text-sm"><Phone className="h-4 w-4 mr-2 text-primary" /><a href={`tel:${contact.primaryPhoneNumber}`} className="hover:underline">{contact.primaryPhoneNumber}</a></div>}
                            {contact.emailPrimary && <div className="flex items-center text-sm"><Send className="h-4 w-4 mr-2 text-primary" /><a href={`mailto:${contact.emailPrimary}`} className="hover:underline truncate">{contact.emailPrimary}</a></div>}
                            {contact.website && <div className="flex items-center text-sm"><Globe className="h-4 w-4 mr-2 text-primary" /><a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{contact.website}</a></div>}
                            {contact.addressStreet && <div className="flex items-center text-sm"><MapPin className="h-4 w-4 mr-2 text-primary" /><a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{contact.addressStreet}</a></div>}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex flex-col items-start gap-4">
                    <div className="w-full flex justify-between items-center">
                         <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setExpanded(!expanded)}>
                           {expanded ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                           Details
                         </Button>
                         <div className="flex items-center space-x-2">
                            <Checkbox id={`used-${contact.id}`} checked={hasUsedService} onCheckedChange={handleToggleUsedService} />
                            <label htmlFor={`used-${contact.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I used this
                            </label>
                            {contact.usedBy?.length > 0 && <Badge variant="outline" className="dark:border-green-500/50 dark:text-green-400">{contact.usedBy.length} used</Badge>}
                        </div>
                    </div>
                    <div className="w-full space-y-2">
                       <Button variant="outline" className="w-full dark:bg-slate-700" onClick={() => setShowComments(!showComments)}>
                          {showComments ? 'Hide' : 'Show'} Reviews ({contact.comments?.length || 0})
                       </Button>

                       <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full pt-2 space-y-4"
                            >
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
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
                                  )) : <p className="text-sm text-center text-muted-foreground">No reviews yet. Be the first!</p>}
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Your Rating & Review</h4>
                                  <StarRating rating={contact.ratings?.find(r=>r.userId === currentUser.id)?.rating || 0} onRate={handleRate} />
                                  <form onSubmit={handleAddComment} className="flex gap-2">
                                    <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your experience..." rows={2} className="text-sm dark:bg-slate-700"/>
                                    <Button type="submit" size="sm">Post</Button>
                                  </form>
                                </div>
                            </motion.div>
                        )}
                       </AnimatePresence>
                    </div>
                </CardFooter>
            </motion.div>
            <ReportContactDialog
                isOpen={isReportDialogOpen}
                onOpenChange={setIsReportDialogOpen}
                contactName={`${contact.firstName} ${contact.lastName || ''}`}
                onSubmit={handleReportSubmit}
            />
            </>
        );
    };

    export default ContactCard;