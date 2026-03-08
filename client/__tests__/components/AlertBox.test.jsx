import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import AlertBox from "../../src/components/AlertBox";

describe("AlertBox", () => {
  it("renders children text", () => {
    render(<AlertBox>Mensaje de alerta</AlertBox>);

    expect(screen.getByText("Mensaje de alerta")).toBeInTheDocument();
  });

  it("applies warning styles by default", () => {
    const { container } = render(<AlertBox>aviso</AlertBox>);

    expect(container.firstChild.className).toMatch(/amber/);
  });

  it("applies error styles when variant is error", () => {
    const { container } = render(<AlertBox variant="error">error</AlertBox>);

    expect(container.firstChild.className).toMatch(/red/);
  });

  it("applies info styles when variant is info", () => {
    const { container } = render(<AlertBox variant="info">info</AlertBox>);

    expect(container.firstChild.className).toMatch(/neutral/);
  });

  it("merges extra className prop", () => {
    const { container } = render(<AlertBox className="mt-4">texto</AlertBox>);

    expect(container.firstChild.className).toMatch(/mt-4/);
  });
});
