import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Home from "../../src/pages/Home";
import useWalletStore from "../../src/store/useWalletStore";

jest.mock("bip39", () => ({
  generateMnemonic: () => "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  useWalletStore.getState().reset();
  mockNavigate.mockClear();
});

const renderHome = () => render(
  <MemoryRouter>
    <Home />
  </MemoryRouter>,
);

describe("Home", () => {
  it("hides the balance behind dots by default", () => {
    renderHome();

    expect(screen.queryByText(/sats/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("generic").some((el) => el.className.includes("rounded-full") && el.className.includes("bg-neutral"),
    )).toBe(true);
  });

  it("reveals balance when dots are clicked", () => {
    useWalletStore.setState({ lightningBalance: 50_000 });
    const { container } = renderHome();

    const dotsBtn = container.querySelector("button .rounded-full.bg-neutral-600")?.closest("button");
    fireEvent.click(dotsBtn);

    expect(screen.getByText("50,000")).toBeInTheDocument();
    expect(screen.getByText("sat")).toBeInTheDocument();
  });

  it("shows 'añade liquidez' button when there are no open channels", () => {
    renderHome();

    expect(screen.getByRole("button", { name: /añade liquidez/i })).toBeInTheDocument();
  });

  it("shows liquidity bar when there are open channels", () => {
    useWalletStore.setState({
      lightningBalance: 25_000,
      channels: [{ id: "ch1", status: "open", capacity: 50_000, localBalance: 25_000, remoteBalance: 25_000, peerNodeId: "peer1" }],
    });
    renderHome();

    expect(screen.queryByRole("button", { name: /añade liquidez/i })).not.toBeInTheDocument();
  });

  it("shows empty history message when there are no transactions", () => {
    renderHome();

    expect(screen.getByText(/sin transacciones/i)).toBeInTheDocument();
  });

  it("renders transaction history when transactions exist", () => {
    useWalletStore.setState({
      transactions: [{
        id: "tx-1",
        type: "receive",
        amount: 1000,
        timestamp: Date.now(),
        description: "Pago de prueba",
      }],
    });
    renderHome();

    expect(screen.getByText("Pago de prueba")).toBeInTheDocument();
  });

  it("shows bot invoice card in solo mode", () => {
    useWalletStore.setState({
      soloMode: true,
      botInvoice: { bolt11: "lnsim1_test", amount: 1000, description: "Bot invoice" },
    });
    renderHome();

    expect(screen.getByText("Bot invoice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pagar/i })).toBeInTheDocument();
  });

  it("navigates to settings when gear icon is clicked", () => {
    renderHome();

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });

  it("navigates to channels when list icon is clicked", () => {
    renderHome();

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    expect(mockNavigate).toHaveBeenCalledWith("/channels");
  });
});
