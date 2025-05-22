import * as d3 from "d3";

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
