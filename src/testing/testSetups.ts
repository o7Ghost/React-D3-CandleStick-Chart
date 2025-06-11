import "@testing-library/jest-dom";

const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

ResizeObserver = ResizeObserverMock;
