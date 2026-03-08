import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import PageHeader from "../../src/components/PageHeader";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => mockNavigate.mockClear());

const renderHeader = (props) => render(
  <MemoryRouter>
    <PageHeader {...props} />
  </MemoryRouter>,
);

describe("PageHeader", () => {
  it("renders the title", () => {
    renderHeader({ title: "Recibir" });

    expect(screen.getByText("Recibir")).toBeInTheDocument();
  });

  it("renders the back button with Inicio label", () => {
    renderHeader({ title: "Recibir" });

    expect(screen.getByRole("button", { name: /inicio/i })).toBeInTheDocument();
  });

  it("navigates to /home by default when back button is clicked", () => {
    renderHeader({ title: "Enviar" });

    fireEvent.click(screen.getByRole("button", { name: /inicio/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("navigates to custom backTo path when provided", () => {
    renderHeader({ title: "Detalle", backTo: "/channels" });

    fireEvent.click(screen.getByRole("button", { name: /inicio/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/channels");
  });

  it("renders right slot content when provided", () => {
    renderHeader({ title: "Test", right: <span>Acción</span> });

    expect(screen.getByText("Acción")).toBeInTheDocument();
  });
});
