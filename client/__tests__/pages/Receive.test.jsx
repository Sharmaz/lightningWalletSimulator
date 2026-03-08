import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Receive from "../../src/pages/Receive";
import useWalletStore from "../../src/store/useWalletStore";

jest.mock("bip39", () => ({
  generateMnemonic: () => "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
}));

beforeEach(() => {
  useWalletStore.getState().reset();
  useWalletStore.getState().generateWallet();
  jest.useFakeTimers();
});

afterEach(() => jest.useRealTimers());

const renderReceive = () => render(
  <MemoryRouter>
    <Receive />
  </MemoryRouter>,
);

describe("Receive", () => {
  it("renders the amount input and generate button", () => {
    renderReceive();

    expect(screen.getByPlaceholderText(/1000/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generar invoice/i })).toBeInTheDocument();
  });

  it("generate button is disabled when amount is empty", () => {
    renderReceive();

    expect(screen.getByRole("button", { name: /generar invoice/i })).toBeDisabled();
  });

  it("shows QR and bolt11 after generating an invoice", () => {
    renderReceive();

    fireEvent.change(screen.getByPlaceholderText(/1000/i), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: /generar invoice/i }));

    expect(screen.getByText(/invoice generado/i)).toBeInTheDocument();
    expect(screen.getByText(/lnsim1_/i)).toBeInTheDocument();
  });

  it("shows toast when invoice is marked as paid", () => {
    renderReceive();

    fireEvent.change(screen.getByPlaceholderText(/1000/i), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: /generar invoice/i }));

    const invoice = useWalletStore.getState().invoices[0];
    act(() => {
      useWalletStore.setState((s) => ({
        invoices: s.invoices.map((i) => (i.id === invoice.id ? { ...i, status: "paid" } : i)),
      }));
    });

    expect(screen.getByText(/pago recibido — 1,000 sats/i)).toBeInTheDocument();
  });

  it("toast disappears after 3 seconds", () => {
    renderReceive();

    fireEvent.change(screen.getByPlaceholderText(/1000/i), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: /generar invoice/i }));

    const invoice = useWalletStore.getState().invoices[0];
    act(() => {
      useWalletStore.setState((s) => ({
        invoices: s.invoices.map((i) => (i.id === invoice.id ? { ...i, status: "paid" } : i)),
      }));
    });

    expect(screen.getByText(/pago recibido/i)).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(3300));

    expect(screen.queryByText(/pago recibido/i)).not.toBeInTheDocument();
  });
});
