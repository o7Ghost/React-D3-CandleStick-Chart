import { useEffect, useRef, useState } from "react";

export const useChartDimensions = (): [
  React.RefObject<HTMLDivElement | null>,
  { chartWidth: number; chartHeight: number }
] => {
  const dimensionsRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  const heightRef = useRef<number>(0);

  useEffect(() => {
    const element = dimensionsRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }

      const entry = entries[0];

      for (const entry of entries) {
        console.log("entry", entry);
      }

      console.log("inital width and", width);
      console.log(
        "what is div width and height",
        entry.contentRect.width,
        entry.contentRect.height
      );
      console.log(width !== entry.contentRect.width);

      if (width !== entry.contentRect.width) {
        console.log("entered");
        setWidth(entry.contentRect.width);
      }

      console.log("----------------------------------");

      // console.log("inital height", height);
      // console.log(
      //   "what is div height",
      //   entry.contentRect.height,
      //   heightRef.current
      // );
      // console.log(
      //   height !== entry.contentRect.height,
      //   heightRef.current !== entry.contentRect.height
      // );

      if (height !== entry.contentRect.height) {
        heightRef.current = entry.contentRect.height;
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(element);

    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, []);

  const dimensions = {
    chartWidth: width,
    chartHeight: height,
  };

  return [dimensionsRef, dimensions];
};
