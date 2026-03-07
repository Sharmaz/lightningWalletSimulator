import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import App from "../src/App";

test("renders onboarding screen on initial load", () => {
  render(<App />);

  expect(screen.getByText("Lightning Wallet")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /crear mi wallet/i })).toBeInTheDocument();
});
