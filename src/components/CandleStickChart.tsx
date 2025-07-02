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

  const boundedWidth = dimensions.chartWidth - 35; // 30 for y-axis
  const boundedHeight = dimensions.chartHeight - 10; // 10 for x-axis

  const visibleCandleCount = Math.floor(boundedWidth / CANDLE_UNIT_WIDTH);

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

  const initialVisibleData =
    data.length > visibleCandleCount
      ? data.slice(data.length - visibleCandleCount)
      : data;

  const baseXScale = d3.scaleTime(
    initialVisibleData.length > 0
      ? [
          new Date(initialVisibleData[0]?.date),
          new Date(initialVisibleData[initialVisibleData.length - 1]?.date),
        ]
      : [new Date(), new Date()],
    [0, boundedWidth]
  );

  const xScale = currentTransform.rescaleX(baseXScale);

  const getVisibleData = useCallback(() => {
    const [startDate, endDate] = xScale.domain();

    const dateFilteredData = data.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });

    if (dateFilteredData.length > visibleCandleCount) {
      return dateFilteredData.slice(-visibleCandleCount);
    }

    return dateFilteredData;
  }, [data, xScale, visibleCandleCount]);

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
      // Clear any existing zoom behavior
      const svg = d3.select(svgRef.current);
      svg.on(".zoom", null);
      return;
    }

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 50]) // Min and max zoom levels
      .translateExtent([
        [-boundedWidth * 10, -Infinity], // Allow extensive panning
        [boundedWidth * 10, Infinity],
      ])
      .filter((event) => {
        // Allow zoom only when holding Ctrl/Cmd key, or for touch gestures
        if (event.type === "wheel") {
          return event.ctrlKey || event.metaKey; // Only zoom with Ctrl/Cmd + wheel
        }
        // Allow drag for panning
        if (event.type === "mousedown") {
          return true;
        }
        // Allow touch gestures
        if (event.type === "touchstart") {
          return true;
        }
        return false;
      })
      .on("zoom", (event) => {
        setCurrentTransform(event.transform);
      });

    const svg = d3.select(svgRef.current);
    svg.call(zoom);

    // // Double-click to reset
    // svg.on("dblclick.zoom", () => {
    //   svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    // });

    return () => {
      svg.on(".zoom", null);
    };
  }, [boundedWidth, boundedHeight, baseXScale]);

  console.log("visibleData", visibleData);

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
