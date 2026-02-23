import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { ChartData } from "../type";
import {
  CANDLE_UNIT_WIDTH,
  CHART_HEIGHT_DEFAULT_PADDING,
  CHART_WIDTH_DEFAULT_PADDING,
  SVG_DOMAIN_CLASS,
} from "../constant";
import { useChartDimensions, usePanDrag, useZoom } from "../hooks";
import {
  computeYAxisTicks,
  findLocalMinAndMax,
  getOptimalTicksForZoom,
} from "../utils";
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

  const boundedWidth = dimensions.chartWidth - CHART_WIDTH_DEFAULT_PADDING;
  const boundedHeight = dimensions.chartHeight - CHART_HEIGHT_DEFAULT_PADDING;

  // CANDLE_UNIT_WIDTH accounts for the CANDLE_WIDTH and CANDLE_SPACING
  const visibleCandleCount = Math.floor(
    dimensions.chartWidth / CANDLE_UNIT_WIDTH,
  );

  const candlesInView = useZoom(svgRef, data.length, visibleCandleCount);

  const spacing = boundedWidth / candlesInView;

  const { endIndex } = usePanDrag(svgRef, data.length, spacing, candlesInView);

  const effectiveEndIndex = endIndex ?? data.length;

  const clampedEnd = Math.min(
    data.length,
    Math.max(visibleCandleCount, effectiveEndIndex),
  );

  // calculate the range of data
  const exactStart = clampedEnd - candlesInView;

  const startIdx = Math.max(0, Math.floor(exactStart));
  // +1 for the boundary candle (slice is exclusive), +ceil(...) to cover the padding zone
  const rightBuffer = 1 + Math.ceil(CHART_WIDTH_DEFAULT_PADDING / spacing);
  const endIdx = Math.min(data.length, Math.ceil(clampedEnd) + rightBuffer);

  const visibleData = data.length === 0 ? [] : data.slice(startIdx, endIdx);

  // partialTransform accounts for the case when we have a fractional candle in view, so we need to shift the chart accordingly
  const partialTransform = (Math.max(0, exactStart) - startIdx) * spacing;

  const xScale = d3.scaleTime(
    [
      new Date(visibleData[0]?.timestamp),
      new Date(visibleData[visibleData.length - 1]?.timestamp),
    ],
    [0, (visibleData.length - 1) * spacing],
  );

  const bounds = findLocalMinAndMax([
    ...visibleData.map((vd) => vd.high),
    ...visibleData.map((vd) => vd.low),
  ]);

  const yScale = d3.scaleLinear(bounds, [0, boundedHeight]);

  useEffect(() => {
    const { interval, format } = getOptimalTicksForZoom(
      boundedWidth,
      visibleData,
    );

    const xAxisGenerator = d3
      .axisBottom(xScale)
      .ticks(interval)
      .tickFormat((d) => {
        return d3.timeFormat(format)(d as Date);
      })

      .tickSize(dimensions.chartHeight)
      .tickSizeOuter(0);

    if (xAxis.current) {
      d3.select(xAxis.current)
        .call(xAxisGenerator)
        .select(SVG_DOMAIN_CLASS)
        .remove();
    }
  }, [xScale, boundedWidth, dimensions.chartHeight, visibleData]);

  useEffect(() => {
    const { tickCount } = computeYAxisTicks(bounds, boundedHeight);

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
  }, [yScale, bounds, boundedHeight, dimensions.chartWidth]);

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
          transform={`translate(${-partialTransform}, -${CHART_HEIGHT_DEFAULT_PADDING})`}
        />
        <g
          ref={yAxis}
          transform={`translate(-${CHART_WIDTH_DEFAULT_PADDING}, 0)`}
        />

        <g transform={`translate(${-partialTransform}, 0)`}>
          <Upperwick xScale={xScale} yScale={yScale} chartData={visibleData} />
          <Body xScale={xScale} yScale={yScale} chartData={visibleData} />
          <Lowerwick xScale={xScale} yScale={yScale} chartData={visibleData} />
        </g>
      </svg>
    </div>
  );
};

export default CandleStickChart;
