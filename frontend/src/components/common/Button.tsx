import React from 'react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'elderly';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { elderlyMode } = useAccessibilityStore();

  const effectiveSize = elderlyMode && size !== 'sm' ? 'elderly' : size;

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-forest-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-wide';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[46px]',
    lg: 'px-7 py-3.5 text-base gap-2.5 min-h-[52px]',
    elderly: 'px-8 py-4.5 text-xl font-bold gap-3 min-h-[60px] min-w-[150px] shadow-md', // Elderly accessibility standard
  };

  const variantStyles = {
    primary: 'bg-forest-700 hover:bg-forest-800 text-white shadow-soft active:scale-[0.98]',
    secondary: 'bg-ivory-200 hover:bg-ivory-300 text-charcoal-900 active:scale-[0.98]',
    gold: 'bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold shadow-soft active:scale-[0.98]',
    outline: 'border-2 border-ivory-300 hover:border-forest-700 text-charcoal-900 hover:bg-ivory-100/60 bg-transparent',
    danger: 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-soft',
    ghost: 'hover:bg-ivory-200/60 text-charcoal-700',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles[effectiveSize]} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
