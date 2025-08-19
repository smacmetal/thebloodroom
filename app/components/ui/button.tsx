'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'default', ...props }) => {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const variants: Record<string, string> = {
    default: 'bg-pink-600 hover:bg-pink-700 text-white',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
};

