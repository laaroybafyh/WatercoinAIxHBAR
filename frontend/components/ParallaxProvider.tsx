 'use client';

import { useEffect } from 'react';

interface ParallaxProviderProps {
  children: React.ReactNode;
}

export function ParallaxProvider({ children }: ParallaxProviderProps) {
  useEffect(() => {
    // Dynamically require animations to avoid any SSR import side-effects
    // and ensure all DOM APIs exist when these run.
    const { initParallaxBackground, initFloatingCards, initEnhancedHover } = require('../lib/animations');
    const cleanupParallax = initParallaxBackground();
    initFloatingCards();
    initEnhancedHover();

    return () => {
      if (cleanupParallax) cleanupParallax();
    };
  }, []);

  return <>{children}</>;
}

export default ParallaxProvider;
