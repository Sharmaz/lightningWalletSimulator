import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SeedGrid from "../../src/components/SeedGrid";

const WORDS = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot",
  "golf", "hotel", "india", "juliet", "kilo", "lima"];

describe("SeedGrid", () => {
  it("renders all 12 words when visible", () => {
    render(<SeedGrid words={WORDS} visible />);

    WORDS.forEach((word) => {
      expect(screen.getByText(word)).toBeInTheDocument();
    });
  });

  it("renders numbered indices for each word", () => {
    render(<SeedGrid words={WORDS} visible />);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("12.")).toBeInTheDocument();
  });

  it("hides word text when not visible", () => {
    render(<SeedGrid words={WORDS} visible={false} />);

    WORDS.forEach((word) => {
      expect(screen.queryByText(word)).not.toBeInTheDocument();
    });
  });

  it("renders 12 placeholder bars when not visible", () => {
    const { container } = render(<SeedGrid words={WORDS} visible={false} />);

    const bars = container.querySelectorAll(".bg-neutral-700");
    expect(bars.length).toBe(12);
  });

  it("defaults to visible when prop is omitted", () => {
    render(<SeedGrid words={WORDS} />);

    expect(screen.getByText("alpha")).toBeInTheDocument();
  });
});
