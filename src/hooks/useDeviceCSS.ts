import { useState, useEffect } from 'react';
import logger from '@/lib/logger';
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceConfig {
  device: DeviceType;
  breakpoint: number;
  cssFile: string;
}

const BREAKPOINTS = {
  mobile: 767,
  tablet: 1199,
  desktop: 1200,
};

export const useDeviceCSS = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');
  const [isLoaded, setIsLoaded] = useState(false);

  const getDeviceType = (width: number): DeviceType => {
    if (width <= BREAKPOINTS.mobile) return 'mobile';
    if (width <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  };

  useEffect(() => {
    // Dynamic CSS imports
    const loadDeviceCSS = async (device: DeviceType) => {
      try {
        switch (device) {
          case 'mobile':
            await import('@/styles/mobile.css');
            break;
          case 'tablet':
            await import('@/styles/tablet.css');
            break;
          case 'desktop':
            await import('@/styles/desktop.css');
            break;
        }
        setIsLoaded(true);
      } catch (error) {
        logger.error('Failed to load device CSS:', error);
      }
    };

    // Initial detection
    const initialDevice = getDeviceType(window.innerWidth);
    setCurrentDevice(initialDevice);
    loadDeviceCSS(initialDevice);

    // Resize handler with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newDevice = getDeviceType(window.innerWidth);
        if (newDevice !== currentDevice) {
          setCurrentDevice(newDevice);
          loadDeviceCSS(newDevice);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [currentDevice]);

  // Return device info and utility classes
  return {
    device: currentDevice,
    isLoaded,
    isMobile: currentDevice === 'mobile',
    isTablet: currentDevice === 'tablet',
    isDesktop: currentDevice === 'desktop',
    containerClass: `${currentDevice}-container`,
    overflowClass: `${currentDevice}-overflow-fix`,
  };
};

// Utility function to get responsive class names
export const getResponsiveClasses = (device: DeviceType, classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  all?: string;
}) => {
  const baseClasses = classes.all || '';
  const deviceClasses = classes[device] || '';
  return `${baseClasses} ${deviceClasses}`.trim();
};

export default useDeviceCSS;
