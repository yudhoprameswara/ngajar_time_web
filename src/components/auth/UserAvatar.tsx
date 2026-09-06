import React from 'react';
import { UserModel } from '../../types';

interface UserAvatarProps {
  user?: UserModel | null;
  photoUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  photoUrl,
  name,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  const effectivePhoto = photoUrl !== undefined ? photoUrl : user?.photoUrl;
  const effectiveName = name ?? user?.displayName ?? 'G';
  const initial = effectiveName.trim().length > 0 ? effectiveName.trim()[0].toUpperCase() : 'G';

  // If the photoUrl is raw base64 (e.g. from Flutter mobile app), prepend data URI prefix
  const formattedPhoto = React.useMemo(() => {
    if (!effectivePhoto) return null;
    const trimmed = effectivePhoto.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `data:image/jpeg;base64,${trimmed}`;
  }, [effectivePhoto]);

  React.useEffect(() => {
    setImgError(false);
  }, [formattedPhoto]);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  if (formattedPhoto && !imgError) {
    return (
      <img
        src={formattedPhoto}
        alt={effectiveName}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shadow-sm ring-2 ring-white/20 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/20 select-none ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
};
