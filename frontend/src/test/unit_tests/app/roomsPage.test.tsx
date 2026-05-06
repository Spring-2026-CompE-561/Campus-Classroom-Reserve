import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// mock auth → must be false so page renders
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    isLoggedIn: false,
  }),
}));

// mock fetch so it doesn't crash
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as any;

import RoomsPage from "@/app/rooms/page";

describe("RoomsPage", () => {
  it("renders page heading", async () => {
    render(<RoomsPage />);

    expect(
      await screen.findByText(/Browse Rooms/i)
    ).toBeInTheDocument();
  });

  it("shows loading text initially", async () => {
    render(<RoomsPage />);

    expect(
      await screen.findByText(/Loading rooms/i)
    ).toBeInTheDocument();
  });
});