import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ChartData } from "../type";
import { CANDLE_UNIT_WIDTH, MINUTE_DISPLAY_FORMAT } from "../constant";
import { useChartDimensions } from "../hooks";

// option to load all at once or load by some window
// TODO: 1 min chart
//       5 min chart
//      15 min chart
//      30 min chart
//       1 hr  chart
//       4 hr  chart
//       1 day chart
const CandleStickChart = ({ data }: { data: ChartData[] }) => {
  const [dimensionsRef, chartWidth] = useChartDimensions();
  const xAxis = useRef<SVGGElement | null>(null);

  const visibleCandleCount = Math.floor(chartWidth / CANDLE_UNIT_WIDTH);

  // Get the slice of data that fits in the viewport (most recent data)
  const visibleData =
    data.length > visibleCandleCount
      ? data.slice(data.length - visibleCandleCount)
      : data;

  const xScale = d3.scaleTime(
    [
      new Date(visibleData[0]?.date),
      new Date(visibleData[visibleData.length - 1]?.date),
    ],
    [0, chartWidth]
  );

  useEffect(() => {
    const xAxisGenerator = d3
      .axisBottom(xScale)
      .ticks(d3.timeMinute.every(15))
      .tickFormat((d) => {
        const date = d as Date;
        return d3.timeFormat(MINUTE_DISPLAY_FORMAT)(date);
      })
      .tickSizeOuter(0);

    if (xAxis.current) {
      d3.select(xAxis.current).call(xAxisGenerator);
    }
  }, [xScale]);

  return (
    <div className="candle-stick-chart-container" ref={dimensionsRef}>
      <svg className="candle-stick-chart" width={chartWidth} height={"100%"}>
        <g ref={xAxis} transform={`translate(0, 10)`} />
      </svg>
    </div>
  );
};

export default CandleStickChart;
