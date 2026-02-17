import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ChartData } from "../type";
import {
  CANDLE_UNIT_WIDTH,
  CHART_HEIGHT_DEFAULT_PADDING,
  CHART_WIDTH_DEFAULT_PADDING,
  SVG_DOMAIN_CLASS,
} from "../constant";
import { useChartDimensions } from "../hooks";
import {
  calculateZoomBounds,
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
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [maxBounds, setMaxBounds] = useState({ leftBound: 0, rightBound: 0 });

  const boundedWidth = dimensions.chartWidth - CHART_WIDTH_DEFAULT_PADDING;
  const boundedHeight = dimensions.chartHeight - CHART_HEIGHT_DEFAULT_PADDING;

  const visibleCandleCount = Math.floor(
    dimensions.chartWidth / CANDLE_UNIT_WIDTH,
  );

  const getVisibleData = () => {
    const effectiveVisibleCandleCount = Math.floor(
      visibleCandleCount / transform.k,
    );

    if (data.length <= effectiveVisibleCandleCount) {
      return data;
    }

    const candlesPerPixel = effectiveVisibleCandleCount / dimensions.chartWidth;

    const scalingOffSetBalance = (1 - transform.k) * dimensions.chartWidth;

    let candleOffset =
      (parseFloat(Math.abs(transform.x).toFixed(4)) -
        parseFloat(scalingOffSetBalance.toFixed(4))) *
      candlesPerPixel;

    let startIndex: number;

    startIndex = Math.max(
      0,
      data.length - effectiveVisibleCandleCount - candleOffset,
    );

    return data.slice(startIndex, startIndex + effectiveVisibleCandleCount);
  };

  const visibleData = getVisibleData();

  const xScale = d3.scaleTime(
    [
      new Date(visibleData[0]?.timestamp),
      new Date(visibleData[visibleData.length - 1]?.timestamp),
    ],
    [0, boundedWidth],
  );

  const bounds = findLocalMinAndMax([
    ...visibleData.map((vd) => vd.high),
    ...visibleData.map((vd) => vd.low),
  ]);

  const yScale = d3.scaleLinear(bounds, [0, boundedHeight]);

  useEffect(() => {
    if (!svgRef.current) return;

    const maxLeftTranslateX =
      data.length > visibleCandleCount
        ? (data.length - visibleCandleCount) * CANDLE_UNIT_WIDTH
        : 0;

    const maxRightTranslateX = dimensions.chartWidth;

    setMaxBounds({
      leftBound: maxLeftTranslateX,
      rightBound: maxRightTranslateX,
    });

    const zoomOutBound = calculateZoomBounds(
      maxLeftTranslateX,
      maxRightTranslateX,
    );

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([zoomOutBound, 1])
      .translateExtent([
        [-maxLeftTranslateX, 0],
        [maxRightTranslateX, 0],
      ])
      .on("zoom", (event) => {
        const { transform } = event;

        setTransform({ ...transform, x: Math.max(0, transform.x) });
      });

    d3.select(svgRef.current).call(zoom);

    // Cleanup
    return () => {
      d3.select(svgRef.current).on(".zoom", null);
    };
  }, [data.length, boundedWidth]);

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
  }, [xScale]);

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
  }, [yScale]);

  return (
    <div
      className="candle-stick-chart-container"
      ref={dimensionsRef}
      style={{ height: 1000 }}
    >
      {/* <div>Y: {transform.y}</div> */}
      <div>X: {transform.x}</div>
      <div>Zoom: {transform.k}</div>

      <div>Right Bound: {maxBounds.rightBound}</div>
      <div>Left Bound: {maxBounds.leftBound}</div>
      <div>visiable data: {visibleData.length}</div>
      <div>
        {calculateZoomBounds(maxBounds.leftBound, maxBounds.rightBound)}
      </div>
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
