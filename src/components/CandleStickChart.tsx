import * as d3 from "d3";
import { useEffect, useRef } from "react";

// option to load all at once or load by some window
// TODO: 1 min chart
//       5 min chart
//      15 min chart
//      30 min chart
//       1 hr  chart
//       4 hr  chart
//       1 day chart

const CandleStickChart = ({ data }: { data: any[] }) => {
  const xAxis = useRef<SVGGElement | null>(null);
  //   const yAxis = useRef<SVGGElement | null>(null);

  const xScale = d3.scaleTime([data[0], data[data.length - 1]], [0, 1000]);

  useEffect(() => {
    const xAxisGenerator = d3.axisBottom(xScale);
    if (xAxis.current) {
      d3.select(xAxis.current).call(xAxisGenerator);
    }
  }, [xScale]);

  return (
    <div
      className="candle-stick-chart-container"
      style={
        {
          // height: styles.height,
          // width: styles.width,
          // display: "inline-block",
        }
      }
    >
      <svg
        className="candle-stick-chart"
        style={{
          height: "100%",
          width: "100%",
          display: "block",
        }}
      >
        <g ref={xAxis} transform={`translate(0, 10)`} />
        {/* <g ref={yAxis} /> */}
      </svg>
    </div>
  );
};

export default CandleStickChart;
