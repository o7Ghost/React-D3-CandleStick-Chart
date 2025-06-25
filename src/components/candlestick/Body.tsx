import * as d3 from "d3";
import { useRef } from "react";
import { ChartData } from "../../type";
import {
  calculateCandleStickSpacing,
  calculateCandleStickWidth,
  parseDate,
} from "../../utils";

export const Body = ({
  yScale,
  xScale,
  chartData,
}: {
  yScale: any;
  xScale: d3.ScaleTime<number, number, never>;
  chartData: ChartData[];
}) => {
  const candleStickBodyContainerRef = useRef<SVGGElement | null>(null);

  const bodyCandleWidth = calculateCandleStickWidth(
    calculateCandleStickSpacing(chartData),
    chartData,
    xScale
  );

  d3.select(candleStickBodyContainerRef.current)
    .selectAll("rect")
    .data(chartData)
    // .enter()
    .join("rect")
    .attr("width", bodyCandleWidth)
    .attr("height", (d) => {
      return d.open > d.close
        ? yScale(d.close) - yScale(d.open)
        : yScale(d.open) - yScale(d.close);
    })
    .attr("x", (d) => {
      return xScale(parseDate(d.date)) - bodyCandleWidth / 2;
    })
    .attr("y", (d) => {
      return d.open > d.close ? yScale(d.open) : yScale(d.close);
    })
    .attr("stroke", (d) => {
      return d.open > d.close ? "#e13443" : "#089981";
    })
    .attr("fill", (d) => (d.open < d.close ? "#089981" : "#e13443"));

  return <g ref={candleStickBodyContainerRef} />;
};
