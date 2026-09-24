import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	href?: string;
	variant?: 'primary' | 'secondary' | 'ghost';
	children: ReactNode;
};

export function Button({ href, variant = 'primary', className = '', children, ...props }: ButtonProps) {
	const styles = {
		primary: 'bg-brand-green text-brand-navy hover:bg-emerald-300',
		secondary: 'border border-slate-200 bg-white text-brand-navy hover:bg-slate-50',
		ghost: 'text-brand-navy hover:bg-slate-100'
	}[variant];
	const classes = `inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${styles} ${className}`;

	if (href) return <Link href={href} className={classes}>{children}</Link>;
	return <button {...props} className={classes}>{children}</button>;
}
