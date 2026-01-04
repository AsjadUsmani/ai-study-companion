import { ImageResponse } from 'next/og';

/**
 * Next.js App Router Icon Generator
 * This file automatically generates the favicon and app icons for your site.
 * Location: web/src/app/icon.tsx
 */

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      // Favicon Design: A condensed, high-contrast version of the Synapse Star
      <div
        style={{
          fontSize: 24,
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Synapse Star for Favicon visibility */}
          <path
            d="M50 5 L56 44 L95 50 L56 56 L50 95 L44 56 L5 50 L44 44 Z"
            fill="url(#icon-grad)"
          />
          <defs>
            <linearGradient id="icon-grad" x1="0" y1="0" x2="100" y2="100">
              <stop stopColor="#A78BFA" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}