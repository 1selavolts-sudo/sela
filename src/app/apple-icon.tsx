import { ImageResponse } from 'next/og';
import { brandColors, emblemPaths } from '@/components/brand-logo';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS rounds the corners itself, so this icon is a full square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brandColors.navy }}>
        <svg width="120" height="120" viewBox="0 0 330 320">
          <defs>
            <linearGradient id="bolt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={brandColors.cyan} />
              <stop offset="100%" stopColor={brandColors.green} />
            </linearGradient>
          </defs>
          <path d={emblemPaths.top} fill="#FFFFFF" />
          <path d={emblemPaths.bottom} fill="#FFFFFF" />
          <path d={emblemPaths.bolt} fill="url(#bolt)" />
        </svg>
      </div>
    ),
    size
  );
}
