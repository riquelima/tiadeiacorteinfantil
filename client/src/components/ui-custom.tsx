import React from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-gradient-to-r from-[#A78BFA] to-[#93C5FD] text-white hover:opacity-90 focus:ring-purple-500',
      secondary: 'bg-gradient-to-r from-[#86EFAC] to-[#FBBF24] text-gray-800 hover:opacity-90 focus:ring-green-500',
      outline: 'border-2 border-[#A78BFA] text-[#A78BFA] hover:bg-[#A78BFA] hover:text-white focus:ring-purple-500',
      ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    
    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <div className={cn(
      'bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl p-4 md:p-6',
      hover && 'card-hover cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default', 
  className = '' 
}) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      variantClasses[variant],
      className
    )}>
      {status}
    </span>
  );
};

interface SectionHeaderProps {
  title: string;
  emoji?: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  emoji,
  description,
  className = ''
}) => {
  return (
    <div className={cn('text-center mb-6 md:mb-8 px-4', className)}>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        {emoji && <span className="text-2xl md:text-3xl">{emoji}</span>}
        {title}
      </h2>
      {description && (
        <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};
