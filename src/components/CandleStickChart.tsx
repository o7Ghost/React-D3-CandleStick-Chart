import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ChartData } from "../type";
import {
  CANDLE_UNIT_WIDTH,
  MINUTE_DISPLAY_FORMAT,
  SVG_DOMAIN_CLASS,
} from "../constant";
import { useChartDimensions } from "../hooks";
import { findLocalMinAndMax } from "../utils";
import { Body, Lowerwick, Upperwick } from "./candlestick";

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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  const boundedWidth = dimensions.chartWidth - 40; // 30 for y-axis
  const boundedHeight = dimensions.chartHeight - 10; // 10 for x-axis

  const visibleCandleCount = Math.floor(boundedWidth / CANDLE_UNIT_WIDTH);

  const getVisibleData = () => {
    if (data.length <= visibleCandleCount) {
      return data;
    }

    const candlesPerPixel = visibleCandleCount / boundedWidth;

    const candleOffset = Math.floor(Math.abs(transform.x) * candlesPerPixel);

    let startIndex: number;

    startIndex = Math.max(0, data.length - visibleCandleCount - candleOffset);

    startIndex = Math.min(startIndex, data.length - visibleCandleCount);
    startIndex = Math.max(0, startIndex);

    return data.slice(startIndex, startIndex + visibleCandleCount);
  };

  const visibleData = getVisibleData();

  const xScale = d3.scaleTime(
    [
      new Date(visibleData[0]?.timestamp),
      new Date(visibleData[visibleData.length - 1]?.timestamp),
    ],
    [0, boundedWidth]
  );

  console.log(
    findLocalMinAndMax([
      ...visibleData.map((vd) => vd.high),
      ...visibleData.map((vd) => vd.low),
    ])
  );

  const yScale = d3.scaleLinear(
    findLocalMinAndMax([
      ...visibleData.map((vd) => vd.high),
      ...visibleData.map((vd) => vd.low),
    ]),
    [0, boundedHeight]
  );

  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const maxLeftTranslateX =
      data.length > visibleCandleCount
        ? (data.length - visibleCandleCount) *
          (boundedWidth / visibleCandleCount)
        : 0;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1]) // Disable scaling
      .translateExtent([
        [-maxLeftTranslateX, 0],
        [dimensions.chartWidth, 0],
      ])
      .on("zoom", (event) => {
        const { transform } = event;
        setTransform({ x: transform.x, y: 0, k: 1 });
      });

    d3.select(svgRef.current).call(zoom);

    // Cleanup
    return () => {
      d3.select(svgRef.current).on(".zoom", null);
    };
  }, [data.length, visibleCandleCount, boundedWidth]);

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
    const [minPrice, maxPrice] = findLocalMinAndMax([
      ...visibleData.map((vd) => vd.high),
      ...visibleData.map((vd) => vd.low),
    ]);

    const priceRange = (maxPrice ?? 0) - (minPrice ?? 0);

    // Base: 80px per tick, but also scale with price range
    // You can tweak the divisor (e.g., 80) and multiplier (e.g., 6) for your needs
    const baseTickCount = Math.max(3, Math.floor(boundedHeight / 80));
    const rangeFactor = Math.max(1, Math.floor(priceRange / 6));
    const tickCount = Math.max(
      3,
      Math.min(baseTickCount, baseTickCount + rangeFactor)
    );

    const yAxisGenerator = d3
      .axisRight(yScale)
      .tickSize(dimensions.chartWidth)
      // .ticks(tickCount)
      .ticks(tickCount)
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

  console.log("visibleData", visibleData);

  return (
    <div
      className="candle-stick-chart-container"
      ref={dimensionsRef}
      style={{ height: "100dvh" }}
    >
      <svg
        ref={svgRef}
        preserveAspectRatio="xMidYMid meet"
        className="candle-stick-chart"
        style={{
          display: "block",
        }}
        width={dimensions.chartWidth}
        height={dimensions.chartHeight}
      >
        <g ref={xAxis} transform={`translate(0, -10)`} />
        <g ref={yAxis} transform={`translate(-40, 0)`} />

        <Upperwick xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Body xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Lowerwick xScale={xScale} yScale={yScale} chartData={visibleData} />
      </svg>
    </div>
  );
};

export default CandleStickChart;
