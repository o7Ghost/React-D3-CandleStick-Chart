import * as d3 from "d3";
import { ChartData } from "../type";
import { DEFAULT_PIXELS_PER_CANDLE, MIN_PRICE_TICK_COUNT } from "../constant";

/**
 * Finds the minimum and maximum values in an array of numbers.
 *
 * @param arr - An array of numbers to find the local minimum and maximum from
 * @returns A tuple containing the max and min values in reverse order [max, min], or an empty array if the input is invalid
 *
 * @example
 * // Returns [5, 1]
 * findLocalMinAndMax([1, 3, 5, 2])
 *
 * @example
 * // Returns []
 * findLocalMinAndMax([])
 */
export const findLocalMinAndMax = (arr: number[]): [number, number] | [] => {
  const extent = d3.extent(arr);

  if (!extent || extent.some((value) => value === undefined)) {
    return [];
  }

  return extent.reverse() as [number, number];
};

export const parseDate = (dateStr: string | Date) => new Date(dateStr);

/**
 * Calculates the optimal spacing width for candlestick chart elements based on time intervals.
 *
 * This function analyzes the provided chart data to find the minimum time difference between
 * consecutive data points, then calculates an appropriate width for candlestick rendering
 * by reducing the minimum interval by 30% to ensure proper spacing and visual separation.
 *
 * @param filteredData - Array of chart data objects containing date information
 * @returns The calculated width for candlestick spacing in milliseconds, adjusted for visual spacing
 *
 * @example
 * ```typescript
 * const chartData = [
 *   { date: '2023-01-01', ... },
 *   { date: '2023-01-02', ... },
 *   { date: '2023-01-03', ... }
 * ];
 * const spacing = calculateCandleStickSpacing(chartData);
 * ```
 */
export const calculateCandleStickSpacing = (chartData: ChartData[]) => {
  if (chartData.length < 2) return 0;

  const times = chartData
    .map((x) => parseDate(x.timestamp).getTime())
    .sort((a, b) => a - b);

  let minInterval = times[1] - times[0];

  for (let i = 1; i < times.length - 1; i++) {
    const interval = times[i + 1] - times[i];
    if (interval < minInterval) {
      minInterval = interval;
    }
  }

  return minInterval * 0.7; // Reduce by 30%
};

// TODO: need to show a fixed width when there's only one canndle stick
export const calculateCandleStickWidth = (
  candleSpacing: number,
  chartData: ChartData[],
  xScale: d3.ScaleTime<number, number, never>
) => {
  if (chartData.length === 0) return 0;

  const minMax = d3.extent(
    chartData.map((chartData) => parseDate(chartData.timestamp))
  ) as [Date, Date];

  const tempCandleWidth =
    xScale(minMax[0].getTime() + candleSpacing) - xScale(minMax[0].getTime());

  return tempCandleWidth * 0.7;
};

export const computeYAxisTicks = (
  bounds: [number, number] | [],
  boundedHeight: number
) => {
  const [upperBoundPrice, lowerBoundPrice] = bounds;

  const minPrice = lowerBoundPrice ?? 0;
  const maxPrice = upperBoundPrice ?? 0;

  const priceRange = maxPrice - minPrice;

  const pxPerPrice =
    priceRange === 0
      ? DEFAULT_PIXELS_PER_CANDLE
      : Math.max(boundedHeight / priceRange, DEFAULT_PIXELS_PER_CANDLE);

  const approxTickCount = Math.max(3, Math.floor(boundedHeight / pxPerPrice));

  const tickStep = d3.tickStep(minPrice, maxPrice, approxTickCount);

  let tickCount = Math.ceil(priceRange / tickStep);

  tickCount = Math.max(MIN_PRICE_TICK_COUNT, tickCount);

  return {
    minPrice,
    maxPrice,
    priceRange,
    pxPerPrice,
    approxTickCount,
    tickStep,
    tickCount,
  };
};

export const calculateZoomBounds = (leftBound: number, rightBound: number) => {
  // Calculate total range
  const totalRange = rightBound + leftBound;

  console.log(leftBound, rightBound, totalRange);

  // Calculate k₀ using the ratio formula
  const k0 = rightBound / totalRange;

  return k0;
};
