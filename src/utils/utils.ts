import * as d3 from "d3";
import { ChartData } from "../type";

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
 * Calculates the width of a candle in pixels for a candlestick chart.
 *
 * @param candleLockerWidthDate - The time interval in milliseconds that determines the base width for each candle
 * @param dateRange - Array of chart data containing date information for the chart
 * @param xScale - D3 time scale function that maps date values to pixel positions on the x-axis
 *
 * @returns The calculated candle width in pixels, reduced by 30% for spacing between candles
 *
 * @example
 * ```typescript
 * const candleWidth = calculateCandleWidth(
 *   86400000, // 1 day in milliseconds
 *   chartData,
 *   xScale
 * );
 * ```
 */
export const calculateCandleWidthDate = (filteredData: ChartData[]) => {
  const times = filteredData.map((x) => x.date).sort();
  let indexes = [0, 1];
  let min = parseDate(times[1]).getTime() - parseDate(times[0]).getTime();

  for (let i = 1; i < times.length; i++) {
    if (
      parseDate(times[i + 1]).getTime() - parseDate(times[i]).getTime() <
      min
    ) {
      min = parseDate(times[i + 1]).getTime() - parseDate(times[i]).getTime();
      indexes = [i, i + 1];
    }
  }

  let rWidth =
    parseDate(times[indexes[1]]).getTime() -
    parseDate(times[indexes[0]]).getTime();
  rWidth -= rWidth * 0.3;
  return rWidth;
};
