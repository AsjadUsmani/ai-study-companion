import React from 'react';

/**
 * Logo.tsx
 * A premium, animated SVG logo for the Synapse application.
 * Features a neural-inspired star with a glowing gradient and subtle animations.
 * * Props:
 * - className: Standard Tailwind classes for sizing (e.g., "w-12 h-12")
 * - showText: Boolean to show "SYNAPSE" alongside the icon
 */

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        {/* Glow Effect Layer */}
        <div className="absolute inset-0 bg-violet-600/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 overflow-visible"
        >
          {/* Subtle Outer Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="46" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-violet-500/20" 
            strokeDasharray="4 4"
          />

          {/* Neural Connection Lines */}
          <g className="opacity-40">
            <path d="M50 10 Q75 25 90 50" stroke="url(#line-grad)" strokeWidth="0.5" />
            <path d="M90 50 Q75 75 50 90" stroke="url(#line-grad)" strokeWidth="0.5" />
            <path d="M50 90 Q25 75 10 50" stroke="url(#line-grad)" strokeWidth="0.5" />
            <path d="M10 50 Q25 25 50 10" stroke="url(#line-grad)" strokeWidth="0.5" />
          </g>

          {/* Main Star Shape */}
          <path
            d="M50 8L55 45L92 50L55 55L50 92L45 55L8 50L45 45L50 8Z"
            fill="url(#main-grad)"
            className="drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]"
          >
            <animate 
              attributeName="opacity" 
              values="0.8;1;0.8" 
              dur="3s" 
              repeatCount="indefinite" 
            />
          </path>

          {/* Core Hub Nodes */}
          <circle cx="50" cy="8" r="2.5" fill="#A78BFA" className="animate-pulse" />
          <circle cx="50" cy="92" r="2.5" fill="#A78BFA" />
          <circle cx="8" cy="50" r="2.5" fill="#60A5FA" />
          <circle cx="92" cy="50" r="2.5" fill="#60A5FA" />

          <defs>
            <linearGradient id="main-grad" x1="8" y1="8" x2="92" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C084FC" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0" y1="0" x2="100" y2="100">
              <stop stopColor="#A78BFA" stopOpacity="0.2" />
              <stop offset="1" stopColor="#60A5FA" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
          SYNAPSE
        </span>
      )}
    </div>
  );
};

export default Logo;