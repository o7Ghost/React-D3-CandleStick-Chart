import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { ChartData } from "../type";
import {
  CANDLE_UNIT_WIDTH,
  MINUTE_DISPLAY_FORMAT,
  SVG_DOMAIN_CLASS,
} from "../constant";
import { useChartDimensions } from "../hooks";
import { findLocalMinAndMax } from "../utils";
import { Body, Lowerwick } from "./candlestick";

// option to load all at once or load by some window
// TODO: 1 min chart
//       5 min chart
//      15 min chart
//      30 min chart
//       1 hr  chart
//       4 hr  chart
//       1 day chart
const CandleStickChart = ({ data }: { data: ChartData[] }) => {
  const [dimensionsRef, dimensions] = useChartDimensions();
  const xAxis = useRef<SVGGElement | null>(null);
  const yAxis = useRef<SVGGElement | null>(null);

  const boundedWidth = dimensions.chartWidth - 30; // 30 for y-axis
  const boundedHeight = dimensions.chartHeight - 10; // 10 for x-axis

  const visibleCandleCount = Math.floor(boundedWidth / CANDLE_UNIT_WIDTH);

  const visibleData =
    data.length > visibleCandleCount
      ? data.slice(data.length - visibleCandleCount)
      : data;

  const xScale = d3.scaleTime(
    [
      new Date(visibleData[0]?.date),
      new Date(visibleData[visibleData.length - 1]?.date),
    ],
    [0, boundedWidth]
  );

  const yScale = d3.scaleLinear(
    findLocalMinAndMax([
      ...visibleData.map((vd) => vd.high),
      ...visibleData.map((vd) => vd.low),
    ]),
    [0, boundedHeight]
  );

  useEffect(() => {
    const xAxisGenerator = d3
      .axisBottom(xScale)
      .ticks(d3.timeMinute.every(15))
      .tickFormat((d) => {
        const date = d as Date;
        return d3.timeFormat(MINUTE_DISPLAY_FORMAT)(date);
      })

      .tickSize(dimensions.chartHeight)
      .tickSizeOuter(0);

    if (xAxis.current) {
      d3.select(xAxis.current)
        .call(xAxisGenerator)
        .select(SVG_DOMAIN_CLASS)
        .remove();
    }
  }, [xScale]);

  useEffect(() => {
    // const tickCount = Math.max(3, Math.floor(dimensions.chartHeight / 80));

    const yAxisGenerator = d3
      .axisRight(yScale)
      .tickSize(dimensions.chartWidth)
      // .ticks(tickCount)
      // .tickFormat((d) => {
      //   return d3.format(".2f")(d);
      // })
      .tickSizeOuter(0);

    if (yAxis.current) {
      d3.select(yAxis.current)
        .call(yAxisGenerator)
        .select(SVG_DOMAIN_CLASS)
        .remove();
    }
  }, [yScale]);

  return (
    <div
      className="candle-stick-chart-container"
      ref={dimensionsRef}
      style={{ height: "100dvh" }}
    >
      <svg
        preserveAspectRatio="xMidYMid meet"
        className="candle-stick-chart"
        style={{
          display: "block",
        }}
        width={dimensions.chartWidth}
        height={dimensions.chartHeight}
      >
        <g ref={xAxis} transform={`translate(0, -10)`} />
        <g ref={yAxis} transform={`translate(-30, 0)`} />

        <Body xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Lowerwick xScale={xScale} yScale={yScale} chartData={visibleData} />
      </svg>
    </div>
  );
};

export default CandleStickChart;
