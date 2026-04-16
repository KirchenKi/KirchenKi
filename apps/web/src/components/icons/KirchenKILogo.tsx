import React from 'react';

interface KirchenKILogoProps {
  className?: string;
  size?: number;
}

export const KirchenKILogo: React.FC<KirchenKILogoProps> = ({ 
  className = "", 
  size = 48 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={3}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
    >
      {/* Church building - center top */}
      <g transform="translate(35, 5) scale(0.55)">
        {/* Main building */}
        <path d="M25 15L50 0L75 15" />
        <rect x="25" y="15" width="50" height="55" rx="2" />
        {/* Cross */}
        <path d="M50 25V50" strokeWidth={4} />
        <path d="M40 35H60" strokeWidth={4} />
        {/* Door */}
        <path d="M40 70V55C40 52 43 50 50 50C57 50 60 52 60 55V70" />
        {/* Side wings */}
        <path d="M5 35L25 25V70H5V35Z" />
        <path d="M95 35L75 25V70H95V35Z" />
        {/* Side windows */}
        <path d="M12 45V60" strokeWidth={3} />
        <path d="M88 45V60" strokeWidth={3} />
      </g>

      {/* Stopwatch - bottom left */}
      <g transform="translate(5, 55) scale(0.4)">
        {/* Speed lines */}
        <path d="M0 30H15" />
        <path d="M0 45H20" />
        <path d="M0 60H15" />
        {/* Clock body */}
        <circle cx="55" cy="50" r="35" />
        {/* Button top */}
        <path d="M55 10V15" strokeWidth={4} />
        <rect x="47" y="2" width="16" height="10" rx="3" />
        {/* Clock hands */}
        <path d="M55 50L55 30" strokeWidth={3} />
        <path d="M55 50L70 55" strokeWidth={3} />
        {/* Clock dots */}
        <circle cx="55" cy="25" r="2" fill="currentColor" />
        <circle cx="55" cy="75" r="2" fill="currentColor" />
        <circle cx="80" cy="50" r="2" fill="currentColor" />
        <circle cx="30" cy="50" r="2" fill="currentColor" />
      </g>

      {/* People group - bottom right */}
      <g transform="translate(52, 58) scale(0.42)">
        {/* Back row - 3 people */}
        <circle cx="25" cy="15" r="10" />
        <path d="M10 45C10 30 20 25 25 25C30 25 40 30 40 45" />
        
        <circle cx="55" cy="10" r="10" />
        <path d="M40 40C40 25 50 20 55 20C60 20 70 25 70 40" />
        
        <circle cx="85" cy="15" r="10" />
        <path d="M70 45C70 30 80 25 85 25C90 25 100 30 100 45" />
        
        {/* Front row - 2 people */}
        <circle cx="40" cy="40" r="12" />
        <path d="M20 80C20 60 32 52 40 52C48 52 60 60 60 80" />
        
        <circle cx="70" cy="40" r="12" />
        <path d="M50 80C50 60 62 52 70 52C78 52 90 60 90 80" />
      </g>
    </svg>
  );
};
