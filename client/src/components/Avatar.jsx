import React from 'react';

const Avatar = ({ 
  src, 
  alt = "Avatar", 
  size = "md", 
  fallback, 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base", 
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl"
  };

  const baseClasses = "rounded-full flex items-center justify-center font-medium";
  
  if (src) {
    return (
      <img 
        src={src}
        alt={alt}
        className={`${baseClasses} ${sizeClasses[size]} object-cover ${className}`}
      />
    );
  }

  const initials = fallback || alt.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className={`${baseClasses} ${sizeClasses[size]} bg-gray-300 text-gray-700 ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;