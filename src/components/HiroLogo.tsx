import React from 'react';

interface HiroLogoProps {
  className?: string;
  variant?: 'black' | 'white' | 'color';
  width?: number;
  height?: number;
}

export const HiroLogo: React.FC<HiroLogoProps> = ({
  className = 'h-10 w-auto',
  variant = 'black',
  width = 160,
  height = 56,
}) => {
  const fillColor = variant === 'white' ? '#FFFFFF' : '#000000';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 56"
      width={width}
      height={height}
      className={className}
      fill="none"
      aria-label="Hiro Comunicação"
    >
      <defs>
        <linearGradient id="hiroBrandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E6007E" />
          <stop offset="50%" stopColor="#7B1FA2" />
          <stop offset="100%" stopColor="#312783" />
        </linearGradient>
      </defs>

      {/* Geometric Letter 'H' */}
      <rect x="10" y="8" width="10" height="40" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />
      <rect x="32" y="8" width="10" height="40" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />
      <rect x="20" y="24" width="12" height="9" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />
      {/* Top hook serif characteristic of Hiro logo */}
      <rect x="10" y="8" width="18" height="8" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />

      {/* Geometric Letter 'i' */}
      {/* Square dot */}
      <rect x="49" y="8" width="10" height="9" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />
      {/* Stem */}
      <rect x="49" y="22" width="10" height="26" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />

      {/* Geometric Letter 'r' */}
      <rect x="66" y="22" width="10" height="26" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />
      {/* Top arch hook */}
      <rect x="76" y="22" width="14" height="9" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />
      <rect x="82" y="31" width="8" height="7" fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor} />

      {/* Geometric Letter 'o' (square ring) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M97 22H124V48H97V22ZM107 31H114V39H107V31Z"
        fill={variant === 'color' ? 'url(#hiroBrandGrad)' : fillColor}
      />
    </svg>
  );
};

export const HiroGradientBar: React.FC<{ className?: string; height?: string }> = ({
  className = '',
  height = 'h-2',
}) => {
  return (
    <div
      className={`w-full ${height} ${className}`}
      style={{
        background: 'linear-gradient(90deg, #E6007E 0%, #8A2BE2 55%, #312783 100%)',
      }}
    />
  );
};
