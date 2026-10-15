// Inline SVG versions of src/components/SELA_Energy_Ltd_Logo.svg.
// full    – emblem, SELA, ENERGY LTD and tagline, as in the official artwork
// compact – emblem sized to the wordmark, for navbars where the tagline would be unreadable
// mark    – emblem only
// Use tone="dark" on navy backgrounds.

type BrandLogoProps = {
  variant?: 'full' | 'compact' | 'mark';
  tone?: 'light' | 'dark';
  className?: string;
  title?: string;
};

// Emblem shapes in their own coordinates (x 13–316, y 4–316).
export const emblemPaths = {
  top: 'M165 4C77 4 13 62 13 145C13 214 62 258 140 273L140 226C89 214 64 187 64 147C64 93 106 53 165 53C204 53 236 71 254 101L294 77C267 31 220 4 165 4Z',
  bottom: 'M164 316C252 316 316 258 316 176C316 107 268 63 190 48L190 95C241 108 265 135 265 175C265 229 223 268 164 268C125 268 93 250 75 220L35 244C62 290 109 316 164 316Z',
  bolt: 'M184 76L112 183L163 183L137 250L224 137L172 137Z'
};

export const brandColors = {
  navy: '#0A2342',
  teal: '#20AEBF',
  cyan: '#20C6D8',
  green: '#43B649'
};

const tones = {
  light: { primary: brandColors.navy, secondary: brandColors.teal, tagline: brandColors.navy },
  dark: { primary: '#FFFFFF', secondary: brandColors.cyan, tagline: '#E2E8F0' }
};

const wordmarkFont = 'Arial, Helvetica, sans-serif';

export function BrandLogo({ variant = 'full', tone = 'light', className, title = 'SELA ENERGY LTD' }: BrandLogoProps) {
  const colors = tones[tone];
  // Unique per variant and tone, so two different logos on one page don't share a gradient.
  const gradientId = `sela-bolt-${variant}-${tone}`;

  const gradient = (
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={brandColors.cyan} />
        <stop offset="100%" stopColor={brandColors.green} />
      </linearGradient>
    </defs>
  );
  const emblem = (
    <>
      <path d={emblemPaths.top} fill={colors.primary} />
      <path d={emblemPaths.bottom} fill={colors.primary} />
      <path d={emblemPaths.bolt} fill={`url(#${gradientId})`} />
    </>
  );

  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 330 320" role="img" aria-label={title} className={className}>
        {gradient}
        {emblem}
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <svg viewBox="0 0 606 170" role="img" aria-label={title} className={className}>
        {gradient}
        <g transform="scale(0.545) translate(-13 -4)">{emblem}</g>
        <g fontFamily={wordmarkFont}>
          <text x="201" y="94" fontSize="112" fontWeight="800" letterSpacing="5" fill={colors.primary}>SELA</text>
          <text x="208" y="160" fontSize="43" fontWeight="700" letterSpacing="12" fill={colors.secondary}>ENERGY LTD</text>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="50 40 1060 345" role="img" aria-label={`${title}, Powering Rwanda Forward`} className={className}>
      {gradient}
      <g transform="translate(45 45)">
        {emblem}
        <path d="M24 325H304" stroke={brandColors.cyan} strokeWidth="8" strokeLinecap="round" />
      </g>
      <g fontFamily={wordmarkFont}>
        <text x="405" y="198" fontSize="112" fontWeight="800" letterSpacing="5" fill={colors.primary}>SELA</text>
        <text x="412" y="264" fontSize="43" fontWeight="700" letterSpacing="12" fill={colors.secondary}>ENERGY LTD</text>
        <path d="M410 291H1095" stroke={brandColors.green} strokeWidth="6" strokeLinecap="round" />
        <text x="412" y="343" fontSize="25" fontWeight="600" letterSpacing="3.5" fill={colors.tagline}>POWERING RWANDA FORWARD</text>
      </g>
    </svg>
  );
}
