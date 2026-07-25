import React from 'react';
import { LucideIcon } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface CravingTileProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  variant: 'danger' | 'warning' | 'teal' | 'indigo';
  onClick: () => void;
  urgent?: boolean;
}

export const CravingTile: React.FC<CravingTileProps> = ({
  title,
  subtitle,
  icon: Icon,
  variant,
  onClick,
  urgent = false
}) => {
  const handleClick = () => {
    triggerHaptic(urgent ? [100, 50, 100] : 40);
    onClick();
  };

  const variantStyles = {
    danger: 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white border-rose-500/80 shadow-rose-950/50 hover:border-rose-400',
    warning: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white border-amber-400/80 shadow-amber-950/50 hover:border-amber-300',
    teal: 'bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white border-teal-400/80 shadow-teal-950/50 hover:border-teal-300',
    indigo: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border-indigo-400/80 shadow-indigo-950/50 hover:border-indigo-300'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full min-h-[72px] sm:min-h-[84px] p-4 sm:p-5 rounded-2xl border-2 text-left shadow-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-teal-400 flex items-center justify-between gap-4 relative overflow-hidden group ${
        variantStyles[variant]
      } ${urgent ? 'animate-pulse-slow ring-4 ring-rose-500/50' : ''}`}
    >
      <div className="flex items-center gap-3.5 z-10">
        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="font-extrabold text-base sm:text-lg leading-tight tracking-wide">{title}</h3>
          <p className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="z-10 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-extrabold text-xs tracking-wider uppercase backdrop-blur-md flex-shrink-0 border border-white/20">
        1-Tap
      </div>

      {/* Decorative background glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
    </button>
  );
};
