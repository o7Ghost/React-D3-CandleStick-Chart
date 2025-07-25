import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ChartData } from "../type";
import {
  CANDLE_UNIT_WIDTH,
  CHART_HEIGHT_DEFAULT_PADDING,
  CHART_WIDTH_DEFAULT_PADDING,
  MINUTE_DISPLAY_FORMAT,
  MINUTE_INTERVAL,
  SVG_DOMAIN_CLASS,
} from "../constant";
import { useChartDimensions } from "../hooks";
import { computeYAxisTicks, findLocalMinAndMax } from "../utils";
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

  const boundedWidth = dimensions.chartWidth - CHART_WIDTH_DEFAULT_PADDING;
  const boundedHeight = dimensions.chartHeight - CHART_HEIGHT_DEFAULT_PADDING;

  const visibleCandleCount =
    Math.floor(boundedWidth / CANDLE_UNIT_WIDTH) / transform.k;

  const getVisibleData = () => {
    if (data.length <= visibleCandleCount) {
      return data;
    }

    const candlesPerPixel = visibleCandleCount / boundedWidth;

    const candleOffset = Math.floor(Math.abs(transform.x) * candlesPerPixel);

    let startIndex: number;

    // console.log("what is candle offset", candleOffset);

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

  const bounds = findLocalMinAndMax([
    ...visibleData.map((vd) => vd.high),
    ...visibleData.map((vd) => vd.low),
  ]);

  const yScale = d3.scaleLinear(bounds, [0, boundedHeight]);

  // Setup zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const maxLeftTranslateX =
      data.length > visibleCandleCount
        ? (data.length - visibleCandleCount) * CANDLE_UNIT_WIDTH
        : 0;

    const maxRightTranslateX = dimensions.chartWidth / transform.k;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 1])
      .translateExtent([
        [-maxLeftTranslateX, 0],
        [maxRightTranslateX, 0],
      ])
      .on("zoom", (event) => {
        const { transform } = event;

        setTransform((prev) => {
          if (transform.k !== prev.k) {
            return { ...prev, k: transform.k };
          }

          if (transform.x !== prev.x) {
            return { ...prev, x: transform.x };
          }

          return prev;
        });
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
      .ticks(d3.timeMinute.every(MINUTE_INTERVAL))
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
    const tickCount = computeYAxisTicks(bounds, boundedHeight);

    const yAxisGenerator = d3
      .axisRight(yScale)
      .tickSize(dimensions.chartWidth)
      .ticks(tickCount)
      .tickFormat((d) => {
        return d3.format(".2f")(d);
      })
      .tickSizeOuter(0);

    if (yAxis.current) {
      d3.select(yAxis.current)
        .call(yAxisGenerator)
        .select(SVG_DOMAIN_CLASS)
        .remove();
    }
  }, [yScale]);

  console.log("Visible data:", visibleData);

  return (
    <div
      className="candle-stick-chart-container"
      ref={dimensionsRef}
      style={{ height: 1000 }}
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
        <g
          ref={xAxis}
          transform={`translate(0, -${CHART_HEIGHT_DEFAULT_PADDING})`}
        />
        <g
          ref={yAxis}
          transform={`translate(-${CHART_WIDTH_DEFAULT_PADDING}, 0)`}
        />

        <Upperwick xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Body xScale={xScale} yScale={yScale} chartData={visibleData} />
        <Lowerwick xScale={xScale} yScale={yScale} chartData={visibleData} />
      </svg>
    </div>
  );
};

export default CandleStickChart;
