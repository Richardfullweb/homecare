import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, className = '' }) => {
  const [error, setError] = useState(false);
  const defaultAvatar = '/assets/images/default-avatar.png'; // Caminho para a imagem padrão

  const handleError = () => {
    setError(true);
  };

  return (
    <img
      src={error ? defaultAvatar : src || defaultAvatar}
      alt={alt}
      onError={handleError}
      className={`rounded-full object-cover ${className}`}
    />
  );
};

export default Avatar;
