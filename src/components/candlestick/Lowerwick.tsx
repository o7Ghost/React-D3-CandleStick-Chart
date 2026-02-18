import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { ChartData } from "../../type";
import { parseDate } from "../../utils";

export const Lowerwick = ({
  yScale,
  xScale,
  chartData,
}: {
  yScale: d3.ScaleLinear<number, number>;
  xScale: d3.ScaleTime<number, number, never>;
  chartData: ChartData[];
}) => {
  const candleLowerWickContainerRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (candleLowerWickContainerRef.current) {
      d3.select(candleLowerWickContainerRef.current)
        .selectAll("rect")
        .data(chartData)
        .join("rect")
        .attr("width", 1)
        .attr("height", (d) => {
          return d.open > d.close
            ? yScale(d.low) - yScale(d.close)
            : yScale(d.low) - yScale(d.open);
        })
        .attr("x", (d) => {
          return xScale(parseDate(d.timestamp)) - 1 / 2;
        })
        .attr("y", (d) => {
          return d.open > d.close ? yScale(d.close) : yScale(d.open);
        })
        .attr("fill", (d) => (d.open < d.close ? "#089981" : "#e13443"));
    }
  }, [yScale, xScale, chartData]);

  return <g ref={candleLowerWickContainerRef} />;
};
