import React from 'react';

interface HiroLogoProps {
  className?: string;
  variant?: 'color' | 'black' | 'white';
  height?: number | string;
  width?: number | string;
}

export const HiroLogo: React.FC<HiroLogoProps> = ({
  className = 'h-10 w-auto',
  variant = 'color',
  height,
  width,
}) => {
  // If variant is black or white, we can apply css filters to the transparent png or render vector
  const filterStyle =
    variant === 'black'
      ? 'brightness(0)'
      : variant === 'white'
      ? 'brightness(0) invert(1)'
      : 'none';

  return (
    <img
      src="/hiro-logo-transparent.png"
      alt="Hiro Comunicação"
      className={`object-contain inline-block select-none ${className}`}
      style={{
        filter: filterStyle,
        height: height || undefined,
        width: width || undefined,
      }}
      onError={(e) => {
        // Fallback to SVG if image file is not found
        const target = e.currentTarget;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = 'inline-block';
      }}
    />
  );
};

export const HiroGradientBar: React.FC<{ className?: string; height?: string }> = ({
  className = '',
  height = 'h-1.5',
}) => {
  return (
    <div
      className={`w-full ${height} ${className} rounded-full`}
      style={{
        background: 'linear-gradient(90deg, #E6007E 0%, #9B00B4 45%, #4E1BA4 100%)',
      }}
    />
  );
};
