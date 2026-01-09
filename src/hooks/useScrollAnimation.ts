import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible, hasTriggered };
}

// Staggered animation for lists of items
export function useStaggeredAnimation(itemCount: number, baseDelay = 50) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisibleItems(new Set(Array.from({ length: itemCount }, (_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the visibility of items
          Array.from({ length: itemCount }).forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, index]));
            }, index * baseDelay);
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [itemCount, baseDelay]);

  const getItemStyle = (index: number) => ({
    opacity: visibleItems.has(index) ? 1 : 0,
    transform: visibleItems.has(index) ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.4s ease-out, transform 0.4s ease-out`,
  });

  return { containerRef, visibleItems, getItemStyle };
}

// Animation classes for scroll-triggered elements
export const scrollAnimationClasses = {
  fadeUp: "opacity-0 translate-y-8 transition-all duration-500 ease-out",
  fadeUpVisible: "opacity-100 translate-y-0",
  fadeIn: "opacity-0 transition-opacity duration-500 ease-out",
  fadeInVisible: "opacity-100",
  scaleIn: "opacity-0 scale-95 transition-all duration-500 ease-out",
  scaleInVisible: "opacity-100 scale-100",
  slideLeft: "opacity-0 -translate-x-8 transition-all duration-500 ease-out",
  slideLeftVisible: "opacity-100 translate-x-0",
  slideRight: "opacity-0 translate-x-8 transition-all duration-500 ease-out",
  slideRightVisible: "opacity-100 translate-x-0",
};
