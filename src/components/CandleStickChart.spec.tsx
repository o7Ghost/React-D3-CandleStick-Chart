import { render } from "@testing-library/react";
import CandleStickChart from "./CandleStickChart";
import { ChartData } from "../type";

// Mock D3
// jest.mock("d3", () => ({
//   ...jest.requireActual("d3"),
//   select: jest.fn(() => ({
//     call: jest.fn(() => ({
//       select: jest.fn(() => ({
//         remove: jest.fn(),
//       })),
//     })),
//   })),
//   scaleTime: jest.fn(() => jest.fn()),
//   scaleLinear: jest.fn(() => jest.fn()),
//   axisBottom: jest.fn(() => ({
//     ticks: jest.fn().mockReturnThis(),
//     tickFormat: jest.fn().mockReturnThis(),
//     tickSize: jest.fn().mockReturnThis(),
//     tickSizeOuter: jest.fn().mockReturnThis(),
//   })),
//   axisRight: jest.fn(() => ({
//     tickSize: jest.fn().mockReturnThis(),
//     ticks: jest.fn().mockReturnThis(),
//     tickFormat: jest.fn().mockReturnThis(),
//     tickSizeOuter: jest.fn().mockReturnThis(),
//   })),
//   timeMinute: { every: jest.fn() },
//   timeFormat: jest.fn(() => jest.fn()),
//   format: jest.fn(() => jest.fn()),
// }));

// // Mock hooks
// jest.mock("../hooks", () => ({
//   useChartDimensions: () => [jest.fn(), { chartWidth: 800, chartHeight: 400 }],
// }));

// // Mock utils
// jest.mock("../utils", () => ({
//   findLocalMinAndMax: jest.fn(() => [0, 100]),
// }));

const mockData: ChartData[] = [
  {
    date: "2023-01-01T10:00:00Z",
    open: 100,
    high: 110,
    low: 95,
    close: 105,
    adjClose: 105,
    volume: 1000,
  },
  {
    date: "2023-01-01T10:01:00Z",
    open: 105,
    high: 115,
    low: 100,
    close: 110,
    adjClose: 110,
    volume: 1200,
  },
  {
    date: "2023-01-01T10:02:00Z",
    open: 110,
    high: 120,
    low: 105,
    close: 115,
    adjClose: 115,
    volume: 1300,
  },
];

describe("CandleStickChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders chart container", () => {
    render(<CandleStickChart data={mockData} />);

    const container = document.querySelector(".candle-stick-chart-container");
    expect(container).toBeInTheDocument();
  });

  //   test("renders SVG element with correct dimensions", () => {
  //     render(<CandleStickChart data={mockData} />);

  //     const svg = document.querySelector(".candle-stick-chart");
  //     expect(svg).toBeInTheDocument();
  //     expect(svg).toHaveAttribute("width", "800");
  //     expect(svg).toHaveAttribute("height", "400");
  //   });

  //   test("renders with empty data array", () => {
  //     render(<CandleStickChart data={[]} />);

  //     const container = document.querySelector(".candle-stick-chart-container");
  //     expect(container).toBeInTheDocument();
  //   });

  //   test("applies correct container styles", () => {
  //     render(<CandleStickChart data={mockData} />);

  //     const container = document.querySelector(".candle-stick-chart-container");
  //     expect(container).toHaveStyle({ height: "100dvh" });
  //   });

  //   test("applies correct SVG styles", () => {
  //     render(<CandleStickChart data={mockData} />);

  //     const svg = document.querySelector(".candle-stick-chart");
  //     expect(svg).toHaveStyle({ display: "block" });
  //     expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
  //   });

  //   test("renders axis groups with correct transforms", () => {
  //     render(<CandleStickChart data={mockData} />);

  //     const xAxisGroup = document.querySelector(
  //       'g[transform="translate(0, -10)"]'
  //     );
  //     const yAxisGroup = document.querySelector(
  //       'g[transform="translate(-30, 0)"]'
  //     );

  //     expect(xAxisGroup).toBeInTheDocument();
  //     expect(yAxisGroup).toBeInTheDocument();
  //   });
});
