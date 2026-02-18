import { render } from "@testing-library/react";
import CandleStickChart from "./CandleStickChart";
import { ChartData } from "../type";

const mockData: ChartData[] = [
  {
    timestamp: "2023-01-01T10:00:00Z",
    open: 100,
    high: 110,
    low: 95,
    close: 105,
    adjClose: 105,
    volume: 1000,
  },
  {
    timestamp: "2023-01-01T10:01:00Z",
    open: 105,
    high: 115,
    low: 100,
    close: 110,
    adjClose: 110,
    volume: 1200,
  },
  {
    timestamp: "2023-01-01T10:02:00Z",
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

  test("renders SVG element with default dimensions on start", () => {
    render(<CandleStickChart data={mockData} />);

    const svg = document.querySelector(".candle-stick-chart");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "1000");
    expect(svg).toHaveAttribute("height", "1000");
  });

  test("renders with empty data array", () => {
    render(<CandleStickChart data={[]} />);

    const container = document.querySelector(".candle-stick-chart-container");
    expect(container).toBeInTheDocument();
  });
});
