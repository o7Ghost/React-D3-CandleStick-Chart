import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ChartData } from "../type";
import { ResizeObserver } from "@juggle/resize-observer";

// option to load all at once or load by some window
// TODO: 1 min chart
//       5 min chart
//      15 min chart
//      30 min chart
//       1 hr  chart
//       4 hr  chart
//       1 day chart

// useEffect(() => {
//   const updateWidth = () => {
//     if (containerRef.current) {
//       const newWidth = containerRef.current.clientWidth;
//       if (newWidth > 0) {
//         setChartWidth(newWidth);
//       }
//       // If clientWidth is 0 (e.g. display:none), chartWidth retains its previous value (e.g., 600).
//     }
//   };

//   updateWidth(); // Initial measurement

//   window.addEventListener("resize", updateWidth);
//   return () => window.removeEventListener("resize", updateWidth);
// }, []); // Runs once after initial mount and cleans up on unmount.

const useChartDimensions = (): [
  React.RefObject<HTMLDivElement | null>,
  number
] => {
  const dimensionsRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const element: any = dimensionsRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) {
        return;
      }
      if (!entries.length) {
        return;
      }

      const entry = entries[0];

      setWidth(entry.contentRect.width);
      console.log("width", entry.contentRect.width);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.unobserve(element);
  }, []);

  return [dimensionsRef, width];
};

const CandleStickChart = ({ data }: { data: ChartData[] }) => {
  const [dimensionsRef, chartWidth] = useChartDimensions();

  console.log("chartWidth", chartWidth);

  const xAxis = useRef<SVGGElement | null>(null);

  const xScale = d3.scaleTime(
    [new Date(data[0]?.date), new Date(data[data.length - 1]?.date)],
    [0, chartWidth]
  );

  // useEffect(() => {
  //   const updateWidth = () => {
  //     if (containerRef.current) {
  //       const newWidth = containerRef.current.clientWidth;
  //       if (newWidth > 0) {
  //         setChartWidth(newWidth);
  //       }
  //       // If clientWidth is 0 (e.g. display:none), chartWidth retains its previous value (e.g., 600).
  //     }
  //   };

  //   updateWidth(); // Initial measurement

  //   window.addEventListener("resize", updateWidth);
  //   return () => window.removeEventListener("resize", updateWidth);
  // }, []); // Runs once after initial mount and cleans up on unmount.

  useEffect(() => {
    const xAxisGenerator = d3.axisBottom(xScale);
    if (xAxis.current) {
      d3.select(xAxis.current).call(xAxisGenerator);
    }
  }, [xScale]);

  return (
    <div className="candle-stick-chart-container" ref={dimensionsRef}>
      <svg className="candle-stick-chart">
        <g ref={xAxis} transform={`translate(0, 10)`} />
      </svg>
    </div>
  );
};

export default CandleStickChart;
