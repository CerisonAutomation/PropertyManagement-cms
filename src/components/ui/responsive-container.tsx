import { cn } from '@/lib/utils';
import type React from 'react';
import { useEffect, useState } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  content?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | 'prose';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  center?: boolean;
}

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltraWide: boolean;
  orientation: 'portrait' | 'landscape';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  fluid = false,
  content = false,
  maxWidth,
  padding = 'md',
  center = true,
}) => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 1920,
    height: 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isUltraWide: false,
    orientation: 'landscape',
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLargeDesktop: width >= 1440 && width < 1920,
        isUltraWide: width >= 1920,
        orientation: height > width ? 'portrait' : 'landscape',
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const getContainerClasses = () => {
    const classes = [];

    if (fluid) {
      classes.push('container-fluid');
    } else if (content) {
      classes.push('container-content');
    } else {
      classes.push('container');
    }

    // Padding classes
    if (padding !== 'none') {
      classes.push(`p-${padding}`);
    }

    // Center alignment
    if (center) {
      classes.push('mx-auto');
    }

    // Max width classes
    if (maxWidth) {
      classes.push(`max-w-${maxWidth}`);
    }

    return classes.join(' ');
  };

  return (
    <div className={cn(getContainerClasses(), className)}>
      {children}
    </div>
  );
};

// Responsive visibility components
export const VisibleOnMobile: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('block md:hidden', className)}>
    {children}
  </div>
);

export const VisibleOnTablet: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('hidden md:block lg:hidden', className)}>
    {children}
  </div>
);

export const VisibleOnDesktop: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('hidden lg:block', className)}>
    {children}
  </div>
);

export const VisibleOnLargeDesktop: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('hidden xl:block 2xl:hidden', className)}>
    {children}
  </div>
);

export const VisibleOnUltraWide: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('hidden 2xl:block', className)}>
    {children}
  </div>
);

// Responsive layout components
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, className, cols = 1, gap = 'md' }) => {
  const getGridClasses = () => {
    const classes = ['grid', `gap-${gap}`];

    switch (cols) {
      case 1:
        classes.push('grid-cols-1');
        break;
      case 2:
        classes.push('grid-cols-1 md:grid-cols-2');
        break;
      case 3:
        classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
        break;
      case 4:
        classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
        break;
    }

    return classes.join(' ');
  };

  return <div className={cn(getGridClasses(), className)}>{children}</div>;
};

export const ResponsiveFlex: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column' | 'responsive';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({
  children,
  className,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
}) => {
  const getFlexClasses = () => {
    const classes = ['flex', `gap-${gap}`];

    // Direction
    if (direction === 'responsive') {
      classes.push('flex-col md:flex-row');
    } else {
      classes.push(`flex-${direction}`);
    }

    // Alignment
    classes.push(`items-${align}`);
    classes.push(`justify-${justify}`);

    // Wrap
    if (wrap) {
      classes.push('flex-wrap');
    }

    return classes.join(' ');
  };

  return <div className={cn(getFlexClasses(), className)}>{children}</div>;
};

// Responsive text components
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  responsive?: boolean;
}> = ({
  children,
  className,
  size = 'base',
  weight = 'normal',
  align = 'left',
  responsive = true,
}) => {
  const getTextClasses = () => {
    const classes = [];

    if (responsive) {
      // Responsive text sizing
      switch (size) {
        case 'xs':
          classes.push('text-xs mobile:text-sm md:text-base lg:text-lg');
          break;
        case 'sm':
          classes.push('text-sm mobile:text-base md:text-lg lg:text-xl');
          break;
        case 'base':
          classes.push('text-base mobile:text-lg md:text-xl lg:text-2xl');
          break;
        case 'lg':
          classes.push('text-lg mobile:text-xl md:text-2xl lg:text-3xl');
          break;
        case 'xl':
          classes.push('text-xl mobile:text-2xl md:text-3xl lg:text-4xl');
          break;
        case '2xl':
          classes.push('text-2xl mobile:text-3xl md:text-4xl lg:text-5xl');
          break;
        case '3xl':
          classes.push('text-3xl mobile:text-4xl md:text-5xl lg:text-6xl');
          break;
        case '4xl':
          classes.push('text-4xl mobile:text-5xl md:text-6xl lg:text-7xl');
          break;
        case '5xl':
          classes.push('text-5xl mobile:text-6xl md:text-7xl lg:text-8xl');
          break;
        case '6xl':
          classes.push('text-6xl mobile:text-7xl md:text-8xl lg:text-9xl');
          break;
      }
    } else {
      classes.push(`text-${size}`);
    }

    // Weight
    classes.push(`font-${weight}`);

    // Alignment
    classes.push(`text-${align}`);

    return classes.join(' ');
  };

  return <div className={cn(getTextClasses(), className)}>{children}</div>;
};

// Responsive spacing components
export const ResponsiveSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  minHeight?: 'screen' | 'mobile' | 'tablet' | 'desktop';
}> = ({
  children,
  className,
  padding = 'lg',
  margin = 'none',
  minHeight,
}) => {
  const getSectionClasses = () => {
    const classes = [];

    // Padding
    if (padding !== 'none') {
      classes.push(`py-${padding}`);
    }

    // Margin
    if (margin !== 'none') {
      classes.push(`my-${margin}`);
    }

    // Min height
    if (minHeight) {
      classes.push(`min-h-${minHeight}`);
    }

    return classes.join(' ');
  };

  return (
    <section className={cn(getSectionClasses(), className)}>
      {children}
    </section>
  );
};

// Responsive image component
export const ResponsiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | '4/3' | '3/2' | '16/9' | '21/9';
  objectFit?: 'cover' | 'contain' | 'fill';
  sizes?: string;
  priority?: boolean;
}> = ({
  src,
  alt,
  className,
  aspectRatio,
  objectFit = 'cover',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
}) => {
  const getImageClasses = () => {
    const classes = ['w-full', 'h-auto'];

    if (aspectRatio) {
      classes.push(`aspect-${aspectRatio}`);
    }

    if (objectFit) {
      classes.push(`object-${objectFit}`);
    }

    return classes.join(' ');
  };

  return (
    <img
      src={src}
      alt={alt}
      className={cn(getImageClasses(), className)}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
};

// Responsive card component
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
}) => {
  const getCardClasses = () => {
    const classes = ['bg-white', 'dark:bg-gray-800'];

    // Padding
    classes.push(`p-${padding}`);

    // Shadow
    if (shadow !== 'none') {
      classes.push(`shadow-${shadow}`);
    }

    // Rounded
    classes.push(`rounded-${rounded}`);

    return classes.join(' ');
  };

  return (
    <div className={cn(getCardClasses(), className)}>
      {children}
    </div>
  );
};

// Hook for viewport information
export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 1920,
    height: 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isUltraWide: false,
    orientation: 'landscape',
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLargeDesktop: width >= 1440 && width < 1920,
        isUltraWide: width >= 1920,
        orientation: height > width ? 'portrait' : 'landscape',
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  largeDesktop?: T;
  ultraWide?: T;
}): T => {
  const currentViewport = useViewport();

  if (currentViewport.isMobile && values.mobile !== undefined) {
    return values.mobile;
  }
  if (currentViewport.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  if (currentViewport.isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  if (currentViewport.isLargeDesktop && values.largeDesktop !== undefined) {
    return values.largeDesktop;
  }
  if (currentViewport.isUltraWide && values.ultraWide !== undefined) {
    return values.ultraWide;
  }

  // Fallback to desktop or first available value
  return values.desktop ?? values.tablet ?? values.mobile ?? (values as any)[Object.keys(values)[0]];
};

// Hook for responsive breakpoints
export const useBreakpoint = () => {
  const currentViewport = useViewport();

  return {
    isXs: currentViewport.width >= 320,
    isSm: currentViewport.width >= 375,
    isMd: currentViewport.width >= 425,
    isLg: currentViewport.width >= 768,
    isXl: currentViewport.width >= 1024,
    is2xl: currentViewport.width >= 1280,
    is3xl: currentViewport.width >= 1440,
    is4xl: currentViewport.width >= 1680,
    is5xl: currentViewport.width >= 1920,
    is6xl: currentViewport.width >= 2560,
    is7xl: currentViewport.width >= 3440,
    ...currentViewport,
  };
};

export default ResponsiveContainer;
