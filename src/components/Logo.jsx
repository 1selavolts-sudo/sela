import Image from 'next/image';
import brandLogo from './SELA_Energy_Ltd_Logo.svg';

export default function Logo({ variant = 'default', className = '', width, height, ...props }) {
  const common = {
    className,
    style: {
      width: width || 'auto',
      height: height || '56px',
      display: 'block',
      maxWidth: '100%',
      aspectRatio: '20 / 7',
    },
    ...props,
  };

  return (
    <div {...common}>
      <Image
        src={brandLogo}
        alt={variant === 'icon' ? 'SELA ENERGY LTD' : 'SELA ENERGY LTD, Powering Rwanda Forward'}
        width={1200}
        height={420}
        unoptimized
        className="h-full w-full object-contain"
      />
    </div>
  );
}
