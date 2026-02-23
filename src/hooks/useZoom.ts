import { RefObject, useEffect, useState } from "react";
import {
  MAX_CANDLES_IN_VIEW_FACTOR,
  MIN_CANDLES_IN_VIEW,
  ZOOM_INTENSITY,
} from "../constant";

export const useZoom = (
  svgRef: RefObject<SVGSVGElement | null>,
  dataLength: number,
  visibleCandleCount: number,
) => {
  const [candlesInView, setCandlesInView] = useState(visibleCandleCount);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleZoom = (event: WheelEvent) => {
      event.preventDefault();

      const wheel = event.deltaY < 0 ? 1 : -1;
      const zoomFactor = Math.exp(wheel * ZOOM_INTENSITY);

      setCandlesInView((prev) => {
        const current = prev || visibleCandleCount;

        // arbitrary max zoom view factor that i set
        // TODO: try to make it dynamic or have it as a prop to allow user to set it
        const maxCandleInView = Math.min(
          dataLength,
          visibleCandleCount * MAX_CANDLES_IN_VIEW_FACTOR,
        );

        const next = current / zoomFactor;

        return Math.max(MIN_CANDLES_IN_VIEW, Math.min(maxCandleInView, next));
      });
    };

    // use passive false to allow zooming event to call preventDefault
    svg.addEventListener("wheel", handleZoom, { passive: false });

    return () => svg.removeEventListener("wheel", handleZoom);
  }, [dataLength, visibleCandleCount]);

  return candlesInView;
};
