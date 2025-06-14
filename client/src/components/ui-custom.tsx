import React from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg';
    
    const variantClasses = {
      primary: 'bg-[#A678E2] text-white hover:bg-[#8B4ED1] focus:ring-[#A678E2]',
      secondary: 'bg-[#4AB7F0] text-white hover:bg-[#339ED5] focus:ring-[#4AB7F0]',
      outline: 'border-2 border-[#A678E2] text-[#A678E2] hover:bg-[#A678E2] hover:text-white focus:ring-[#A678E2]',
      ghost: 'text-[#A678E2] hover:bg-[#A678E2]/10 focus:ring-[#A678E2]'
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
      'bg-white rounded-3xl p-6 shadow-purple-soft border border-[#4AB7F0]/20',
      hover && 'hover:shadow-blue-soft transition-all duration-300 hover:-translate-y-1',
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
    success: 'bg-[#7BD8B2]/20 text-[#059669] border border-[#7BD8B2]',
    warning: 'bg-[#F9D449]/20 text-[#D97706] border border-[#F9D449]',
    error: 'bg-[#F86D70]/20 text-[#DC2626] border border-[#F86D70]',
    info: 'bg-[#4AB7F0]/20 text-[#0284C7] border border-[#4AB7F0]',
    default: 'bg-[#A678E2]/20 text-[#7C3AED] border border-[#A678E2]'
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
        <p className="text-sm md:text-base lg:text-lg max-w-2xl mx-auto whitespace-pre-line text-[#1f2937]">
          {description}
        </p>
      )}
    </div>
  );
};
