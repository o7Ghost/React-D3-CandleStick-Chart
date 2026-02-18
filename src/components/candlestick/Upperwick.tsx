import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { ChartData } from "../../type";
import { parseDate } from "../../utils";

export const Upperwick = ({
  yScale,
  xScale,
  chartData,
}: {
  yScale: d3.ScaleLinear<number, number>;
  xScale: d3.ScaleTime<number, number, never>;
  chartData: ChartData[];
}) => {
  const candleUpperWickContainerRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!candleUpperWickContainerRef.current) {
      return;
    }

    d3.select(candleUpperWickContainerRef.current)
      .selectAll("rect")
      .data(chartData)
      // .enter()
      .join("rect")
      .attr("width", 1)
      .attr("height", (d) => {
        return d.open > d.close
          ? yScale(d.open) - yScale(d.high)
          : yScale(d.close) - yScale(d.high);
      })
      .attr("x", (d) => {
        return xScale(parseDate(d.timestamp)) - 1 / 2;
      })
      .attr("y", (d) => {
        return yScale(d.high);
      })
      .attr("fill", (d) => (d.open < d.close ? "#089981" : "#e13443"));
  }, [yScale, xScale, chartData]);

  return <g ref={candleUpperWickContainerRef} />;
};
