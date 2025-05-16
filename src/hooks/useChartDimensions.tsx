import { useEffect, useRef, useState } from "react";

export const useChartDimensions = (): [
  React.RefObject<HTMLDivElement | null>,
  number
] => {
  const dimensionsRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const element = dimensionsRef.current;
    if (!element) return;

    // Set initial width
    setWidth(element.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    resizeObserver.observe(element);

    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  return [dimensionsRef, width];
};
