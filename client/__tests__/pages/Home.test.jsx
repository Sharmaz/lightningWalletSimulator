import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Home from "../../src/pages/Home";
import useWalletStore from "../../src/store/useWalletStore";

jest.mock("bip39", () => ({
  generateMnemonic: () => "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
}));

beforeEach(() => {
  useWalletStore.getState().reset();
});

const renderHome = () => render(
  <MemoryRouter>
    <Home />
  </MemoryRouter>,
);

describe("Home", () => {
  it("shows 0 sats lightning balance initially", () => {
    renderHome();

    expect(screen.getByText("0 sats")).toBeInTheDocument();
  });

  it("shows the correct lightning balance from store", () => {
    useWalletStore.setState({ lightningBalance: 50_000 });
    renderHome();

    expect(screen.getByText("50,000 sats")).toBeInTheDocument();
  });

  it("shows the on-chain balance", () => {
    useWalletStore.setState({ onChainBalance: 100_000 });
    renderHome();

    expect(screen.getByText(/on-chain/i)).toBeInTheDocument();
  });

  it("renders Recibir and Enviar buttons", () => {
    renderHome();

    expect(screen.getByRole("button", { name: /recibir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
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
});
