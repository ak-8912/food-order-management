"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends Element>(
  rootMargin = "0px 0px -12% 0px",
  threshold = 0.05
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || isVisible) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      window.requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin, threshold]);

  return { ref, isVisible };
}
