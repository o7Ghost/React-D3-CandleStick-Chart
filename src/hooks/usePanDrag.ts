import * as d3 from "d3";
import { RefObject, useEffect, useState } from "react";

export const usePanDrag = (
  svgRef: RefObject<SVGSVGElement | null>,
  dataLength: number,
  spacing: number,
  candlesInView: number,
) => {
  const [endIndex, setEndIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const drag = d3.drag<SVGSVGElement, unknown>().on("drag", (event) => {
      // spacing with candle width and spacing in between included
      const candleWidthPx = spacing;
      const idxDelta = -event.dx / candleWidthPx;

      setEndIndex((prev) => {
        const current = prev ?? dataLength;
        // minEnd is the smallest end index we can have.
        // in case that data.length is smaller than inital candle view
        // we take the min
        const minEnd = Math.min(candlesInView, dataLength);

        // minEnd here insures that we don't pan beyond what we have
        return Math.max(minEnd, Math.min(dataLength, current + idxDelta));
      });
    });

    d3.select(svgRef.current).call(drag);

    return () => {
      d3.select(svgRef.current).on(".drag", null);
    };
  }, [dataLength, spacing, candlesInView]);

  return { endIndex };
};
