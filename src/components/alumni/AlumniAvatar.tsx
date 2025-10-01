'use client';

import { useState } from 'react';
import { Avatar, AvatarProps, Tooltip } from '@mantine/core';
import { IconUser, IconEyeOff } from '@tabler/icons-react';
import { AlumniProfile } from '@/types';

interface AlumniAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
  alumni: AlumniProfile;
  showPrivacyIndicator?: boolean;
  showTooltip?: boolean;
}

export function AlumniAvatar({
  alumni,
  showPrivacyIndicator = false,
  showTooltip = false,
  ...props
}: AlumniAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const fullName = `${alumni.firstName} ${alumni.lastName}`;
  const initials =
    `${alumni.firstName.charAt(0)}${alumni.lastName.charAt(0)}`.toUpperCase();

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Generate a consistent color based on the alumni's name
  const getAvatarColor = (name: string) => {
    const colors = [
      'blue',
      'cyan',
      'teal',
      'green',
      'lime',
      'yellow',
      'orange',
      'red',
      'pink',
      'grape',
      'violet',
      'indigo',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarElement = (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={!imageError && alumni.profileImage ? alumni.profileImage : null}
        alt={fullName}
        color={getAvatarColor(fullName)}
        onError={handleImageError}
        {...props}
      >
        {!alumni.profileImage || imageError ? initials : null}
      </Avatar>

      {showPrivacyIndicator && !alumni.isPublic && (
        <div
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: 'var(--mantine-color-gray-6)',
            borderRadius: '50%',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
          }}
        >
          <IconEyeOff size={10} color="white" />
        </div>
      )}
    </div>
  );

  if (showTooltip) {
    return <Tooltip label={fullName}>{avatarElement}</Tooltip>;
  }

  return avatarElement;
}

// Group Avatar component for showing multiple alumni
interface AlumniAvatarGroupProps {
  alumni: AlumniProfile[];
  limit?: number;
  size?: AvatarProps['size'];
  showTooltips?: boolean;
}

export function AlumniAvatarGroup({
  alumni,
  limit = 5,
  size = 'md',
  showTooltips = true,
}: AlumniAvatarGroupProps) {
  const displayedAlumni = alumni.slice(0, limit);
  const remainingCount = alumni.length - limit;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: -8 }}>
      {displayedAlumni.map((alumniProfile, index) => (
        <div
          key={alumniProfile.id}
          style={{
            zIndex: displayedAlumni.length - index,
            marginLeft: index > 0 ? -8 : 0,
          }}
        >
          <AlumniAvatar
            alumni={alumniProfile}
            size={size}
            showTooltip={showTooltips}
            style={{
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <Avatar
          size={size}
          color="gray"
          style={{
            marginLeft: -8,
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            zIndex: 0,
          }}
        >
          +{remainingCount}
        </Avatar>
      )}
    </div>
  );
}
