import React, { useState, useEffect, useRef, useMemo } from 'react';
    import { useLocation } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Input } from '@/components/ui/input';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Send, Users, User, ShieldCheck, Search, MessageSquare, BookUser, Building, Phone, Mail } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion, AnimatePresence } from 'framer-motion';
    import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
    import { useLanguage } from '@/contexts/LanguageContext';

    const ResidentMessages = () => {
      const { toast } = useToast();
      const location = useLocation();
      const { t } = useLanguage();

      const [currentUser, setCurrentUser] = useState(null);
      const [messages, setMessages] = useState([]);
      const [allUsers, setAllUsers] = useState([]);
      const [otherResidents, setOtherResidents] = useState([]);
      const [unitGroups, setUnitGroups] = useState([]);
      const [activeChat, setActiveChat] = useState(null);
      const [newMessageContent, setNewMessageContent] = useState('');
      const [searchTerm, setSearchTerm] = useState('');
      const [activeTab, setActiveTab] = useState('chats');
      
      const messagesEndRef = useRef(null);

      const MANAGER_REPRESENTATIVE = {
        id: "manager_representative",
        type: "manager",
        name: "Building Management",
        description: "Official building communications",
      };

      useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        setAllUsers(storedUsers);

        if (user && user.buildingUid) {
          const allMessages = JSON.parse(localStorage.getItem(`messages_${user.buildingUid}`)) || [];
          setMessages(allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));

          const publicResidents = storedUsers.filter(u => 
            u.id !== user.id && 
            u.buildingUid === user.buildingUid && 
            u.role === 'resident' &&
            u.settings?.isPubliclyVisible === true
          );
          setOtherResidents(publicResidents);

          const allGroups = JSON.parse(localStorage.getItem(`unitGroups_${user.buildingUid}`)) || [];
          const userUnitGroups = allGroups.filter(g => user.unitGroups?.includes(g.id));
          setUnitGroups(userUnitGroups);
        }

        if (location.state?.contactManager) {
          setActiveChat(MANAGER_REPRESENTATIVE);
          setActiveTab('chats');
        }

        const handleStorageChange = (event) => {
          if (user && user.buildingUid && event.key === `messages_${user.buildingUid}`) {
            const updatedMessages = JSON.parse(event.newValue) || [];
            setMessages(updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
          }
          if (event.key === 'users') {
             const updatedUsers = JSON.parse(event.newValue) || [];
             setAllUsers(updatedUsers);
           }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }, [location.state]);

      useEffect(() => {
        if (activeChat) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          markMessagesAsRead(activeChat);
        }
      }, [messages, activeChat]);

      const saveMessages = (updatedMessages) => {
        if (currentUser && currentUser.buildingUid) {
          localStorage.setItem(`messages_${currentUser.buildingUid}`, JSON.stringify(updatedMessages));
          setMessages(updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
        }
      };
      
      const markMessagesAsRead = (chat) => {
         if (!chat || !currentUser) return;
         const updatedAllMessages = messages.map(msg => {
            const isUnread = (!msg.readBy || !msg.readBy[currentUser.id]) && msg.senderId !== currentUser.id;
            let isRelevant = false;
            
            if (chat.type === 'resident' && msg.groupId === null) {
                isRelevant = (msg.senderId === chat.id && msg.receiverId === currentUser.id) || (msg.senderId === currentUser.id && msg.receiverId === chat.id);
            } else if (chat.type === 'group') {
                isRelevant = msg.groupId === chat.id;
            } else if (chat.type === 'manager') {
                 isRelevant = (msg.receiverId === currentUser.id && (msg.senderRole === 'manager' || msg.senderRole === 'admin')) || (msg.senderId === currentUser.id && msg.receiverId === MANAGER_REPRESENTATIVE.id);
            }

            if(isRelevant && isUnread) {
                return { ...msg, readBy: { ...msg.readBy, [currentUser.id]: true } };
            }
            return msg;
         });
         saveMessages(updatedAllMessages);
      };

      const handleSendMessage = () => {
        if (!newMessageContent.trim() || !activeChat || !currentUser) return;

        const message = {
          id: `msg_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          senderRole: 'resident',
          receiverId: activeChat.id, // For resident/manager
          groupId: activeChat.type === 'group' ? activeChat.id : null,
          content: newMessageContent,
          timestamp: new Date().toISOString(),
          readBy: { [currentUser.id]: true }
        };

        saveMessages([...messages, message]);
        setNewMessageContent('');
      };

      const handleSelectChat = (chat) => {
        setActiveChat({ id: chat.entityId, type: chat.type, name: chat.name, avatarUrl: chat.avatarUrl });
        markMessagesAsRead({ id: chat.entityId, type: chat.type });
      };

      const startChatFromContact = (contact) => {
        const existingThread = getChatThreads.find(t => t.entityId === contact.id && t.type === contact.type);
        if(existingThread) {
            handleSelectChat(existingThread);
        } else {
            setActiveChat(contact);
        }
        setActiveTab('chats');
        setSearchTerm('');
      }

      const getChatThreads = useMemo(() => {
        const threads = {};

        messages.forEach(msg => {
            let threadId, name, type, entityId, avatarUrl;

            if (msg.groupId) {
                if (!currentUser.unitGroups?.includes(msg.groupId)) return;
                const group = unitGroups.find(g => g.id === msg.groupId);
                threadId = `group_${msg.groupId}`;
                name = group ? group.name : 'Unknown Group';
                type = 'group';
                entityId = msg.groupId;
                avatarUrl = null;
            } 
            else if ((msg.senderId === currentUser.id && msg.receiverId === MANAGER_REPRESENTATIVE.id) || (msg.receiverId === currentUser.id && (msg.senderRole === 'manager' || msg.senderRole === 'admin'))) {
                threadId = 'manager_chat';
                name = MANAGER_REPRESENTATIVE.name;
                type = 'manager';
                entityId = MANAGER_REPRESENTATIVE.id;
                avatarUrl = null;
            }
            else {
                const otherId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
                if(otherId === MANAGER_REPRESENTATIVE.id) return;
                const otherUser = allUsers.find(r => r.id === otherId);
                if (!otherUser) return; 

                threadId = `resident_${otherId}`;
                name = otherUser.fullName;
                type = 'resident';
                entityId = otherId;
                avatarUrl = otherUser.avatarUrl;
            }
            
            if (!threads[threadId]) {
                threads[threadId] = {
                    id: threadId, name, type, entityId, avatarUrl,
                    lastMessage: msg, unreadCount: 0
                };
            }
            if (new Date(msg.timestamp) > new Date(threads[threadId].lastMessage.timestamp)) {
                threads[threadId].lastMessage = msg;
            }
            if (!msg.readBy?.[currentUser.id] && msg.senderId !== currentUser.id) {
                threads[threadId].unreadCount++;
            }
        });
        
        if (!threads['manager_chat']) {
             threads['manager_chat'] = {
                id: 'manager_chat',
                name: MANAGER_REPRESENTATIVE.name,
                type: 'manager',
                entityId: MANAGER_REPRESENTATIVE.id,
                avatarUrl: null,
                lastMessage: { content: 'Contact building management...', timestamp: new Date(0).toISOString(), senderId: 'system' },
                unreadCount: 0
             };
        }

        return Object.values(threads).sort((a,b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
      }, [messages, currentUser, allUsers, unitGroups]);

      const filteredThreads = useMemo(() => {
          if (!searchTerm) return getChatThreads;
          const lowerSearchTerm = searchTerm.toLowerCase();
          return getChatThreads.filter(thread =>
              thread.name.toLowerCase().includes(lowerSearchTerm) ||
              (thread.lastMessage.content && thread.lastMessage.content.toLowerCase().includes(lowerSearchTerm))
          );
      }, [getChatThreads, searchTerm]);

      const contactList = useMemo(() => {
        const combined = [
            MANAGER_REPRESENTATIVE,
            ...otherResidents.map(r => ({
                id: r.id, name: r.fullName,
                description: `Unit ${r.unitNumber || 'N/A'}`, type: 'resident',
                avatarUrl: r.avatarUrl
            })),
            ...unitGroups.map(g => ({
                id: g.id, name: g.name,
                description: `${g.units?.length || 0} units`, type: 'group'
            }))
        ];
        if (!searchTerm) return combined;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return combined.filter(c => c.name.toLowerCase().includes(lowerSearchTerm));
      }, [otherResidents, unitGroups, searchTerm]);

      const currentChatMessages = useMemo(() => {
        if (!activeChat || !currentUser) return [];
        return messages.filter(msg => {
            if (activeChat.type === 'resident') {
                return !msg.groupId && ((msg.senderId === activeChat.id && msg.receiverId === currentUser.id) || (msg.senderId === currentUser.id && msg.receiverId === activeChat.id));
            }
            if (activeChat.type === 'group') {
                return msg.groupId === activeChat.id;
            }
            if (activeChat.type === 'manager') {
                return !msg.groupId && ((msg.senderId === currentUser.id && msg.receiverId === MANAGER_REPRESENTATIVE.id) || (msg.receiverId === currentUser.id && (msg.senderRole === 'manager' || msg.senderRole === 'admin')));
            }
            return false;
        }).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      }, [activeChat, messages, currentUser]);

      const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        if (isToday(date)) return format(date, 'p');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'PP');
      };

      const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };
      
      const getSenderAvatar = (senderId) => {
        if (senderId === currentUser.id) return currentUser.avatarUrl;
        const sender = allUsers.find(u => u.id === senderId);
        return sender ? sender.avatarUrl : null;
      }
      
      const getSenderInitials = (senderId, senderName) => {
        if (senderId === currentUser.id) return getInitials(currentUser.fullName);
        const sender = allUsers.find(u => u.id === senderId);
        return getInitials(sender ? sender.fullName : senderName);
      }
      
      return (
        <Layout role="resident">
            <div className="flex h-full border dark:border-slate-700 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full md:w-1/3 xl:w-1/4 min-w-[280px] max-w-[400px] border-r dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                    <div className="p-4 border-b dark:border-slate-700">
                      <h2 className="text-xl font-semibold dark:text-white mb-4">Messages</h2>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 dark:bg-slate-700 dark:text-white" />
                      </div>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 mx-auto mt-2 max-w-sm">
                            <TabsTrigger value="chats"><MessageSquare className="w-4 h-4 mr-2"/>Chats</TabsTrigger>
                            <TabsTrigger value="contacts"><BookUser className="w-4 h-4 mr-2"/>Contacts</TabsTrigger>
                        </TabsList>
                        <ScrollArea className="flex-grow">
                          <TabsContent value="chats">
                            {filteredThreads.map(thread => (
                              <div key={thread.id} onClick={() => handleSelectChat(thread)}
                                   className={`p-3 border-b dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 ${activeChat?.id === thread.entityId && activeChat?.type === thread.type ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={thread.avatarUrl} alt={thread.name} />
                                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {thread.type === 'manager' ? <ShieldCheck className="h-5 w-5"/> : thread.type === 'group' ? <Users className="h-5 w-5"/> : getInitials(thread.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-semibold dark:text-white text-sm block truncate max-w-[150px]">{thread.name}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                        {thread.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}{thread.lastMessage.content}
                                      </p>
                                    </div>
                                  </div>
                                  <div className='flex flex-col items-end'>
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(thread.lastMessage.timestamp), { addSuffix: true })}</span>
                                      {thread.unreadCount > 0 && <span className="mt-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{thread.unreadCount}</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          <TabsContent value="contacts">
                             {contactList.map(contact => (
                                <div key={`${contact.type}-${contact.id}`} onClick={() => startChatFromContact(contact)} className="p-3 border-b dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                {contact.type === 'manager' ? <ShieldCheck className="h-5 w-5"/> : contact.type === 'group' ? <Users className="h-5 w-5"/> : getInitials(contact.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold dark:text-white">{contact.name}</p>
                                            <p className="text-sm text-muted-foreground">{contact.description}</p>
                                        </div>
                                    </div>
                                </div>
                             ))}
                             {contactList.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">No contacts found.</p>}
                          </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
                <div className="hidden md:flex flex-grow flex-col bg-white dark:bg-slate-900">
                  {activeChat ? (
                    <>
                      <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3 shadow-sm">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={activeChat.avatarUrl} alt={activeChat.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                             {activeChat.type === 'manager' ? <ShieldCheck className="h-5 w-5"/> : activeChat.type === 'group' ? <Users className="h-5 w-5"/> : getInitials(activeChat.name)}
                            </AvatarFallback>
                         </Avatar>
                        <h3 className="text-lg font-semibold dark:text-white">{activeChat.name}</h3>
                      </div>
                      <ScrollArea className="flex-grow p-4">
                        <div className="space-y-2">
                          {currentChatMessages.map((msg) => (
                            <motion.div key={msg.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 my-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                {msg.senderId !== currentUser.id && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={getSenderAvatar(msg.senderId)} />
                                    <AvatarFallback>{getSenderInitials(msg.senderId, msg.senderName)}</AvatarFallback>
                                  </Avatar>
                                )}
                                <div className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-2xl shadow max-w-md ${msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-slate-100 dark:bg-slate-700 dark:text-white rounded-bl-lg'}`}>
                                      {(msg.senderRole === 'manager' || msg.senderRole === 'admin') && msg.senderId !== currentUser.id && <p className="text-xs font-semibold mb-0.5 text-blue-500 dark:text-blue-400">{msg.senderName}</p>}
                                      <p className="text-sm">{msg.content}</p>
                                    </div>
                                    <p className="text-xs mt-1 text-muted-foreground">{formatTimestamp(msg.timestamp)}</p>
                                </div>
                                {msg.senderId === currentUser.id && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={getSenderAvatar(msg.senderId)} />
                                    <AvatarFallback>{getSenderInitials(msg.senderId, msg.senderName)}</AvatarFallback>
                                  </Avatar>
                                )}
                            </motion.div>
                          ))}
                        </div>
                         <div ref={messagesEndRef} />
                      </ScrollArea>
                      <div className="p-4 border-t dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
                        <Textarea value={newMessageContent} onChange={(e) => setNewMessageContent(e.target.value)}
                          placeholder={`Message ${activeChat.name}...`} className="flex-grow resize-none dark:bg-slate-700 dark:text-white"
                          rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}/>
                        <Button onClick={handleSendMessage} disabled={!newMessageContent.trim()}><Send className="h-4 w-4"/></Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="h-24 w-24 mb-4 text-slate-300 dark:text-slate-600" />
                        <h2 className="text-2xl font-bold">Your Message Hub</h2>
                        <p className="text-lg mt-1">Select a conversation or find a contact to begin.</p>
                    </div>
                  )}
                </div>
            </div>
        </Layout>
      );
    };

    export default ResidentMessages;