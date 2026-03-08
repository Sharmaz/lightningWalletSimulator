import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Onboarding from "../../src/pages/Onboarding";
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

const renderOnboarding = () => render(
  <MemoryRouter>
    <Onboarding />
  </MemoryRouter>,
);

describe("Onboarding", () => {
  it("renders the initial screen with the create wallet button", () => {
    renderOnboarding();

    expect(screen.getByText("Lightning Wallet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear mi wallet/i })).toBeInTheDocument();
  });

  it("shows the seed phrase after clicking crear mi wallet", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));

    expect(screen.getByText("Tu seed phrase")).toBeInTheDocument();
    expect(screen.getAllByText("abandon")[0]).toBeInTheDocument();
  });

  it("shows 12 seed words on the seed screen", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));

    const words = screen.getAllByText("abandon");
    expect(words.length + 1).toBe(12);
  });

  it("shows mode selection after clicking entendido", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));

    expect(screen.getByText("Elige tu modalidad")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /modalidad solo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /modalidad p2p/i })).toBeInTheDocument();
  });

  it("P2P is the primary (first) button in mode selection", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));

    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toMatch(/modalidad p2p/i);
  });

  it("navigates to /home after selecting Modalidad Solo", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));
    fireEvent.click(screen.getByRole("button", { name: /modalidad solo/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("navigates to /p2p after selecting Modalidad P2P", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));
    fireEvent.click(screen.getByRole("button", { name: /modalidad p2p/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/p2p");
  });

  it("initializes the wallet in the store after creating it", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));

    expect(useWalletStore.getState().isInitialized).toBe(true);
  });

  it("sets up solo mode state after selecting Modalidad Solo", () => {
    renderOnboarding();
    fireEvent.click(screen.getByRole("button", { name: /crear mi wallet/i }));
    fireEvent.click(screen.getByRole("button", { name: /entendido/i }));
    fireEvent.click(screen.getByRole("button", { name: /modalidad solo/i }));

    expect(useWalletStore.getState().soloMode).toBe(true);
    expect(useWalletStore.getState().lightningBalance).toBe(50_000);
    expect(useWalletStore.getState().channels).toHaveLength(1);
  });
});
