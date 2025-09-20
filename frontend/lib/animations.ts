// Background Parallax Effect Handler
export const initParallaxBackground = () => {
  if (typeof window === 'undefined') return;

  let ticking = false;

  const updateParallax = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const speed = 0.5; // Parallax speed multiplier
    
    // Apply parallax to the background
    const parallaxElements = document.querySelectorAll('body::before');
    
    // Since we can't directly query pseudo-elements, we'll use CSS custom properties
    document.documentElement.style.setProperty('--scroll-y', `${scrollTop * speed}px`);
    
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  // Enhanced scroll listener with throttling
  window.addEventListener('scroll', requestTick, { passive: true });
  
  // Mouse movement parallax effect
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const xPercent = (clientX / innerWidth - 0.5) * 20; // Max 20px movement
    const yPercent = (clientY / innerHeight - 0.5) * 20;
    
    document.documentElement.style.setProperty('--mouse-x', `${xPercent}px`);
    document.documentElement.style.setProperty('--mouse-y', `${yPercent}px`);
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  // Cleanup function
  return () => {
    window.removeEventListener('scroll', requestTick);
    window.removeEventListener('mousemove', handleMouseMove);
  };
};

// Floating animation for cards
export const initFloatingCards = () => {
  if (typeof window === 'undefined') return;

  const cards = document.querySelectorAll('.card, .item, .group');
  
  cards.forEach((card, index) => {
    const delay = index * 100; // Stagger the animations
    const duration = 3000 + (index * 200); // Vary duration
    
    (card as HTMLElement).style.setProperty('--float-delay', `${delay}ms`);
    (card as HTMLElement).style.setProperty('--float-duration', `${duration}ms`);
  });
};

// Enhanced hover effects
export const initEnhancedHover = () => {
  if (typeof window === 'undefined') return;

  const interactiveElements = document.querySelectorAll('.card, .item, .group, .payBtn');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      target.style.setProperty('--hover-scale', '1.05');
      target.style.setProperty('--hover-glow', '0 0 30px rgba(29, 165, 255, 0.4)');
    });

    element.addEventListener('mouseleave', (e) => {
      const target = e.target as HTMLElement;
      target.style.setProperty('--hover-scale', '1');
      target.style.setProperty('--hover-glow', 'none');
    });
  });
};
