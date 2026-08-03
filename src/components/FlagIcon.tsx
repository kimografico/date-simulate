import React from 'react';

interface FlagIconProps {
  code: 'es' | 'pt' | 'front' | 'device' | string;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = 'w-5 h-3.5 inline-block rounded-[2px] shadow-sm overflow-hidden shrink-0' }) => {
  const normalized = code.toLowerCase().trim();

  if (!code || normalized === 'front' || normalized === 'device' || normalized === 'none') {
    return null;
  }

  if (normalized === 'es' || normalized === 'esp' || normalized === 'spain' || normalized === '🇪🇸') {
    return (
      <svg
        viewBox="0 0 750 500"
        className={className}
        aria-label="España"
        role="img"
      >
        <rect width="750" height="500" fill="#c60b1e" />
        <rect width="750" height="250" y="125" fill="#ffc400" />
      </svg>
    );
  }

  if (normalized === 'pt' || normalized === 'por' || normalized === 'portugal' || normalized === '🇵🇹') {
    return (
      <svg
        viewBox="0 0 600 400"
        className={className}
        aria-label="Portugal"
        role="img"
      >
        <rect width="600" height="400" fill="#ff0000" />
        <rect width="240" height="400" fill="#046a38" />
        <circle cx="240" cy="200" r="80" fill="#ffc400" />
      </svg>
    );
  }

  // Globe / Local device default
  return (
    <span className={`text-base leading-none inline-block align-middle ${className}`}>
      🌐
    </span>
  );
};
