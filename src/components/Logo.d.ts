declare const Logo: (props: {
  variant?: 'default' | 'icon' | 'light' | 'dark';
  className?: string;
  width?: string | number;
  height?: string | number;
  [key: string]: unknown;
}) => JSX.Element;

export default Logo;
