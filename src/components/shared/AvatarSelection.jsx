import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const predefinedAvatars = [
  '/avatars/01.png',
  '/avatars/02.png',
  '/avatars/03.png',
  '/avatars/04.png',
  '/avatars/05.png',
  '/avatars/06.png',
];

const AvatarSelection = ({ currentAvatar, onAvatarChange }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onAvatarChange(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    onAvatarChange('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={currentAvatar} alt="User avatar" />
            <AvatarFallback className="text-3xl">
              {getInitials('User')}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            onClick={() => fileInputRef.current.click()}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
          />
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Profile Photo</p>
          <p className="text-sm text-muted-foreground">
            Upload your photo or choose an avatar.
          </p>
          {currentAvatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={handleRemoveAvatar}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Or choose an avatar</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          <button type="button" onClick={() => onAvatarChange('/avatars/01.png')} className={cn('rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', currentAvatar === '/avatars/01.png' && 'ring-2 ring-primary')}>
            <Avatar className="h-16 w-16">
              <img  class="w-full h-full object-cover" alt="Predefined avatar 1" src="https://images.unsplash.com/photo-1693042767804-fe8bc0dbeb95" />
            </Avatar>
          </button>
          <button type="button" onClick={() => onAvatarChange('/avatars/02.png')} className={cn('rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', currentAvatar === '/avatars/02.png' && 'ring-2 ring-primary')}>
            <Avatar className="h-16 w-16">
              <img  class="w-full h-full object-cover" alt="Predefined avatar 2" src="https://images.unsplash.com/photo-1703174208571-12ed2ed159ce" />
            </Avatar>
          </button>
          <button type="button" onClick={() => onAvatarChange('/avatars/03.png')} className={cn('rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', currentAvatar === '/avatars/03.png' && 'ring-2 ring-primary')}>
            <Avatar className="h-16 w-16">
              <img  class="w-full h-full object-cover" alt="Predefined avatar 3" src="https://images.unsplash.com/photo-1616166266966-60e1073630ba" />
            </Avatar>
          </button>
          <button type="button" onClick={() => onAvatarChange('/avatars/04.png')} className={cn('rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', currentAvatar === '/avatars/04.png' && 'ring-2 ring-primary')}>
            <Avatar className="h-16 w-16">
              <img  class="w-full h-full object-cover" alt="Predefined avatar 4" src="https://images.unsplash.com/photo-1701297234661-a33f9f418053" />
            </Avatar>
          </button>
          <button type="button" onClick={() => onAvatarChange('/avatars/05.png')} className={cn('rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', currentAvatar === '/avatars/05.png' && 'ring-2 ring-primary')}>
            <Avatar className="h-16 w-16">
              <img  class="w-full h-full object-cover" alt="Predefined avatar 5" src="https://images.unsplash.com/photo-1688856594450-8aff82736d87" />
            </Avatar>
          </button>
          <button type="button" onClick={() => onAvatarChange('/avatars/06.png')} className={cn('rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', currentAvatar === '/avatars/06.png' && 'ring-2 ring-primary')}>
            <Avatar className="h-16 w-16">
              <img  class="w-full h-full object-cover" alt="Predefined avatar 6" src="https://images.unsplash.com/photo-1695922088600-d6f3927ce9cb" />
            </Avatar>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;