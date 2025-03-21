
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'fade';

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: TransitionDirection;
  className?: string;
}

const getAnimationClass = (direction: TransitionDirection) => {
  switch (direction) {
    case 'left':
      return 'animate-slide-left';
    case 'right':
      return 'animate-slide-right';
    case 'up':
      return 'animate-slide-up';
    case 'down':
      return 'animate-slide-down';
    case 'fade':
    default:
      return 'animate-fade-in';
  }
};

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children,
  direction = 'fade',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Small delay for smoother transitions
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div
      className={cn(
        'w-full',
        isVisible ? getAnimationClass(direction) : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageTransition;
