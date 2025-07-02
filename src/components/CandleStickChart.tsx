import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [currentTransform, setCurrentTransform] = useState<d3.ZoomTransform>(
    d3.zoomIdentity
  );

  const boundedWidth = dimensions.chartWidth - 35; // 35 for y-axis
  const boundedHeight = dimensions.chartHeight - 10; // 10 for x-axis

  const visibleCandleCount = Math.floor(boundedWidth / CANDLE_UNIT_WIDTH);

  const [viewportStartIndex, setViewportStartIndex] = useState(
    Math.max(0, data.length - visibleCandleCount)
  );

  // const visibleData =
  //   data.length > visibleCandleCount
  //     ? data.slice(data.length - visibleCandleCount)
  //     : data;

  // const xScale = d3.scaleTime(
  //   [
  //     new Date(visibleData[0]?.date),
  //     new Date(visibleData[visibleData.length - 1]?.date),
  //   ],
  //   [0, boundedWidth]
  // );

  useEffect(() => {
    setViewportStartIndex(Math.max(0, data.length - visibleCandleCount));
  }, [data]);

  // Create a sliding window of data based on viewport
  const getViewportData = useCallback(() => {
    const startIndex = Math.max(0, viewportStartIndex);
    const endIndex = Math.min(data.length, startIndex + visibleCandleCount);

    return data.slice(startIndex, endIndex);
  }, [data, viewportStartIndex, visibleCandleCount]);

  const viewportData = getViewportData();

  const baseXScale = d3.scaleTime(
    viewportData.length > 0
      ? [
          new Date(viewportData[0]?.date),
          new Date(viewportData[viewportData.length - 1]?.date),
        ]
      : [new Date(), new Date()],
    [0, boundedWidth]
  );

  const xScale = currentTransform.rescaleX(baseXScale);

  const getVisibleData = useCallback(() => {
    const [startDate, endDate] = xScale.domain();

    // Find the indices for the date range within viewport data
    const startIndex = d3.bisectLeft(
      viewportData.map((d) => new Date(d.date)),
      startDate
    );
    const endIndex = d3.bisectRight(
      viewportData.map((d) => new Date(d.date)),
      endDate
    );

    return viewportData.slice(Math.max(0, startIndex), endIndex + 1);
  }, [viewportData, xScale]);

  const visibleData = getVisibleData();

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
  useEffect(() => {
    if (!svgRef.current) return;

    if (!data || data.length === 0) {
      const svg = d3.select(svgRef.current);
      svg.on(".zoom", null);
      return;
    }

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([
        [-boundedWidth * 0.5, -Infinity],
        [boundedWidth * 1.5, Infinity],
      ])
      .filter((event) => {
        if (event.type === "wheel") {
          return event.ctrlKey || event.metaKey;
        }
        if (event.type === "mousedown" || event.type === "touchstart") {
          return true;
        }
        return false;
      })
      .on("zoom", (event) => {
        const transform = event.transform;

        console.log(transform.x, boundedWidth * 0.3);
        // Check if we need to shift the viewport when panning reaches edges
        if (transform.x > boundedWidth * 0.3 && viewportStartIndex > 0) {
          // Panning right, shift viewport left (show earlier data)
          setViewportStartIndex((prev) =>
            Math.max(0, prev - Math.floor(visibleCandleCount * 0.5))
          );
          setCurrentTransform(
            d3.zoomIdentity.scale(transform.k).translate(0, transform.y)
          );
        } else if (
          transform.x < -boundedWidth * 0.3 &&
          viewportStartIndex + visibleCandleCount < data.length
        ) {
          // Panning left, shift viewport right (show later data)
          setViewportStartIndex((prev) =>
            Math.min(
              data.length - visibleCandleCount,
              prev + Math.floor(visibleCandleCount * 0.5)
            )
          );
          setCurrentTransform(
            d3.zoomIdentity.scale(transform.k).translate(0, transform.y)
          );
        } else {
          setCurrentTransform(transform);
        }
      });

    const svg = d3.select(svgRef.current);
    svg.call(zoom);

    return () => {
      svg.on(".zoom", null);
    };
  }, [
    boundedWidth,
    boundedHeight,
    data,
    visibleCandleCount,
    viewportStartIndex,
  ]);

  console.log("visibleData", visibleData, viewportData);

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
          cursor: data && data.length > 0 ? "grab" : "default",
        }}
        ref={svgRef}
        width={dimensions.chartWidth}
        height={dimensions.chartHeight}
      >
        <g ref={xAxis} transform={`translate(0, -10)`} />
        <g ref={yAxis} transform={`translate(-30, 0)`} />

        <Upperwick xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Body xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Lowerwick xScale={xScale} yScale={yScale} chartData={visibleData} />
      </svg>
    </div>
  );
};

export default CandleStickChart;
