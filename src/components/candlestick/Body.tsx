import { useRef } from "react";

export const Body = () => {
  const candleStickBodyContainerRef = useRef<SVGGElement | null>(null);

  return <g ref={candleStickBodyContainerRef} />;
};
