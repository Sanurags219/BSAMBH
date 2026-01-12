
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, glow = true }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div 
          className="absolute inset-0 bg-[#0052FF] blur-[15px] opacity-30 animate-pulse rounded-full"
          style={{ width: size, height: size }}
        />
      )}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full relative z-10"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052FF" />
            <stop offset="100%" stopColor="#8a63d2" />
          </linearGradient>
          <filter id="glass-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
              <fePointLight x="-5000" y="-10000" z="20000" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
          </filter>
        </defs>
        
        {/* Abstract "B" Geometric Shape */}
        <path 
          d="M30 20C30 20 70 20 70 35C70 50 45 50 45 50C45 50 75 50 75 70C75 90 30 90 30 90V20Z" 
          stroke="url(#logo-gradient)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#glass-effect)"
        />
        
        {/* Inner Bridge Detail */}
        <path 
          d="M45 50L60 50" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.8"
        />
        
        {/* Corner Accents */}
        <circle cx="30" cy="20" r="4" fill="#0052FF" />
        <circle cx="30" cy="90" r="4" fill="#8a63d2" />
        <circle cx="70" cy="35" r="2" fill="white" />
        <circle cx="75" cy="70" r="2" fill="white" />
      </svg>
    </div>
  );
};

export default Logo;
