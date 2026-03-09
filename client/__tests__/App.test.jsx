import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import App from "../src/App";

test("renders landing page on initial load", () => {
  render(<App />);

  expect(screen.getByText("BilleteraQuest")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /probar el simulador/i })).toBeInTheDocument();
});
