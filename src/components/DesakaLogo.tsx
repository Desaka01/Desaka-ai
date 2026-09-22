import React from 'react';
import { Camera } from 'lucide-react';

export interface DesakaLogoProps {
  variant?: 'main' | 'icon' | 'horizontal' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customLogoUrl?: string | null;
  className?: string;
  showTagline?: boolean;
  schoolName?: string;
  onEditClick?: () => void;
  shape?: 'rounded' | 'circle' | 'original';
}

export const DesakaLogo: React.FC<DesakaLogoProps> = ({
  variant = 'main',
  size = 'md',
  customLogoUrl,
  className = '',
  showTagline = true,
  schoolName = 'SD Negeri 1 Kalisoro',
  onEditClick,
  shape = 'rounded',
}) => {
  // Sizing definitions
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base',
  };

  const shapeClass = {
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
    original: 'rounded-lg',
  }[shape];

  // Render emblem: either the user's custom device image, or the official SD Negeri 1 Kalisoro emblem
  const renderEmblemIcon = () => {
    return (
      <div className="relative group shrink-0">
        {customLogoUrl ? (
          <div
            className={`${iconSizes[size]} ${shapeClass} overflow-hidden bg-white dark:bg-slate-800 p-0.5 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center transition-transform group-hover:scale-105`}
          >
            <img
              src={customLogoUrl}
              alt={schoolName}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div
            className={`${iconSizes[size]} relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 via-blue-900 to-indigo-950 p-1 shadow-lg shadow-blue-900/30 border border-amber-400/40 transition-transform group-hover:scale-105`}
            title="Logo Bawaan: SD Negeri 1 Kalisoro (Klik untuk ganti dari penyimpanan perangkat)"
          >
            {/* Golden outer glow */}
            <div className="absolute inset-0 rounded-2xl bg-amber-400/15 blur-xs pointer-events-none" />

            {/* Official SD Negeri 1 Kalisoro Emblem SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full relative z-10 drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Shield with Gold & Emerald Rim */}
              <path
                d="M50 7L84 21V52C84 73 50 93 50 93C50 93 16 73 16 52V21L50 7Z"
                fill="url(#kalisoroShield)"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Mount Lawu Contour Silhouette (Tawangmangu highland) */}
              <path
                d="M20 48L35 34L50 44L68 30L80 48V52C80 70 50 88 50 88C50 88 20 70 20 52V48Z"
                fill="#064E3B"
                opacity="0.4"
              />

              {/* Star of Excellence */}
              <polygon
                points="50,11 52.5,17 59,17.5 54,21.5 55.5,28 50,24 44.5,28 46,21.5 41,17.5 47.5,17"
                fill="#FBBF24"
              />

              {/* Tut Wuri Handayani Golden Wings & Torch Flame Motif */}
              <path
                d="M50 28C44 28 35 33 30 42C38 41 45 44 48 48C45 42 43 36 50 28Z"
                fill="#FBBF24"
              />
              <path
                d="M50 28C56 28 65 33 70 42C62 41 55 44 52 48C55 42 57 36 50 28Z"
                fill="#FBBF24"
              />

              {/* Educational Torch Center */}
              <path
                d="M50 33C52 38 54 41 50 47C46 41 48 38 50 33Z"
                fill="#EF4444"
              />
              <circle cx="50" cy="48" r="2" fill="#F59E0B" />

              {/* Open Book of Knowledge */}
              <path
                d="M32 58C40 55 48 57 50 60C52 57 60 55 68 58L70 67C62 64 54 65 50 69C46 65 38 64 30 67L32 58Z"
                fill="#FEF3C7"
                stroke="#D97706"
                strokeWidth="1.5"
              />

              {/* Ribbon Banner: SDN 1 KALISORO */}
              <path
                d="M22 75H78L73 83H27L22 75Z"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="1"
              />
              <text
                x="50"
                y="81.5"
                textAnchor="middle"
                fontSize="6.2"
                fontWeight="900"
                fill="#1E1B4B"
                fontFamily="sans-serif"
                letterSpacing="0.4"
              >
                SDN 1 KALISORO
              </text>

              <defs>
                <linearGradient id="kalisoroShield" x1="50" y1="7" x2="50" y2="93" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1E3A8A" />
                  <stop offset="0.6" stopColor="#065F46" />
                  <stop offset="1" stopColor="#0F172A" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Optional quick edit overlay button */}
        {onEditClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition-all scale-90 hover:scale-110"
            title="Ganti logo dari penyimpanan perangkat"
          >
            <Camera className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  // If icon-only variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblemIcon()}
      </div>
    );
  }

  // Variant: horizontal (optimized for top navbar and compact displays)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {renderEmblemIcon()}
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5 font-black tracking-tight">
            <span className="text-blue-900 dark:text-white font-extrabold tracking-tight text-base sm:text-lg truncate max-w-[200px] sm:max-w-xs">
              {schoolName}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 font-black text-[10px] sm:text-xs shadow-xs shrink-0">
              DESAKA AI
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
            Bel Sekolah Otomatis & Asisten Pintar
          </span>
        </div>
      </div>
    );
  }

  // Variant: Light Mode specific
  if (variant === 'light') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {renderEmblemIcon()}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-black tracking-tight text-blue-950 ${textSizes[size]}`}>
              {schoolName}
            </span>
            <span className="font-extrabold text-amber-500 drop-shadow-xs text-sm">
              DESAKA AI
            </span>
          </div>
          <span className={`font-bold text-blue-800 tracking-normal ${subTextSizes[size]}`}>
            Asisten Sekolah Pintar
          </span>
          {showTagline && (
            <span className="text-[10px] italic text-slate-500 mt-0.5">
              "Cerdas Mengingatkan, Pintar Mengajarkan."
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: Dark Mode specific
  if (variant === 'dark') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {renderEmblemIcon()}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
              {schoolName}
            </span>
            <span className="font-extrabold text-amber-400 text-sm">
              DESAKA AI
            </span>
          </div>
          <span className={`font-semibold text-blue-300 tracking-normal ${subTextSizes[size]}`}>
            Asisten Sekolah Pintar
          </span>
          {showTagline && (
            <span className="text-[10px] italic text-slate-400 mt-0.5">
              "Cerdas Mengingatkan, Pintar Mengajarkan."
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Main full logo with emblem, typography, and tagline
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {renderEmblemIcon()}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className={`font-black tracking-tight text-blue-950 dark:text-white ${textSizes[size]}`}>
            {schoolName}
          </span>
          <span className="font-black text-amber-500 dark:text-amber-400 text-sm tracking-wider">
            DESAKA AI
          </span>
        </div>
        <span className={`font-bold text-blue-700 dark:text-blue-300 tracking-wide ${subTextSizes[size]}`}>
          Bel Sekolah Otomatis & Asisten Pintar
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium italic text-slate-500 dark:text-slate-400 mt-0.5">
            "Cerdas Mengingatkan, Pintar Mengajarkan."
          </span>
        )}
      </div>
    </div>
  );
};
