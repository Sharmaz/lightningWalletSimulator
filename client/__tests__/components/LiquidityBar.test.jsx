import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import LiquidityBar from "../../src/components/LiquidityBar";

const renderBar = (props) => render(<LiquidityBar {...props} />);

describe("LiquidityBar", () => {
  it("renders local and remote balance labels", () => {
    renderBar({ localBalance: 30_000, remoteBalance: 20_000, capacity: 50_000 });

    expect(screen.getByText(/30,000 sats \(tuyo\)/)).toBeInTheDocument();
    expect(screen.getByText(/20,000 sats \(peer\)/)).toBeInTheDocument();
  });

  it("sets local bar width proportional to capacity", () => {
    const { container } = renderBar({ localBalance: 25_000, remoteBalance: 25_000, capacity: 50_000 });

    const localBar = container.querySelector(".bg-green-400");
    expect(localBar.style.width).toBe("50%");
  });

  it("sets remote bar width as remainder", () => {
    const { container } = renderBar({ localBalance: 10_000, remoteBalance: 40_000, capacity: 50_000 });

    const remoteBar = container.querySelector(".bg-blue-500");
    expect(remoteBar.style.width).toBe("80%");
  });

  it("handles zero capacity without crashing", () => {
    renderBar({ localBalance: 0, remoteBalance: 0, capacity: 0 });

    expect(screen.getByText(/0 sats \(tuyo\)/)).toBeInTheDocument();
  });
});
