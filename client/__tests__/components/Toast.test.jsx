import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import Toast from "../../src/components/Toast";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("Toast", () => {
  it("renders the message", () => {
    render(<Toast message="Pago recibido" onDone={() => {}} />);

    expect(screen.getByText("Pago recibido")).toBeInTheDocument();
  });

  it("calls onDone after 3 seconds", () => {
    const onDone = jest.fn();
    render(<Toast message="Pago recibido" onDone={onDone} />);

    act(() => jest.advanceTimersByTime(3300));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("does not call onDone before 3 seconds", () => {
    const onDone = jest.fn();
    render(<Toast message="Pago recibido" onDone={onDone} />);

    act(() => jest.advanceTimersByTime(2000));

    expect(onDone).not.toHaveBeenCalled();
  });
});
