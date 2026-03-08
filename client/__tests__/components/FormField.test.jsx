import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import FormField from "../../src/components/FormField";

describe("FormField", () => {
  it("renders the label", () => {
    render(<FormField label="Monto (sats)" value="" onChange={() => {}} />);

    expect(screen.getByText("Monto (sats)")).toBeInTheDocument();
  });

  it("renders the input with the given placeholder", () => {
    render(<FormField label="Test" placeholder="Ej. 1000" value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText("Ej. 1000")).toBeInTheDocument();
  });

  it("renders the current value", () => {
    render(<FormField label="Test" value="500" onChange={() => {}} />);

    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
  });

  it("calls onChange when the input value changes", () => {
    const handleChange = jest.fn();
    render(<FormField label="Test" type="number" value="" onChange={handleChange} placeholder="num" />);

    fireEvent.change(screen.getByPlaceholderText("num"), { target: { value: "1000" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uses text type by default", () => {
    render(<FormField label="Test" value="" onChange={() => {}} placeholder="texto" />);

    expect(screen.getByPlaceholderText("texto")).toHaveAttribute("type", "text");
  });

  it("uses the given type when specified", () => {
    render(<FormField label="Test" type="number" value="" onChange={() => {}} placeholder="num" />);

    expect(screen.getByPlaceholderText("num")).toHaveAttribute("type", "number");
  });
});
