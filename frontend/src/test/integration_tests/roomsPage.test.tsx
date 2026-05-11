import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    isLoggedIn: false,
  }),
}));

const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: 1,
          building: "ENS",
          room_num: 101,
          capacity: 30,
          features: ["hdmi", "zoom_ready"],
        },
      ]),
  })
) as any;

global.fetch = mockFetch;

import RoomsPage from "@/app/rooms/page";

describe("RoomsPage Integration Test", () => {
  it("fetches and displays rooms from backend", async () => {
    render(<RoomsPage />);

    expect(await screen.findByText(/ENS 101/i)).toBeInTheDocument();
    expect(await screen.findByText(/Capacity: 30/i)).toBeInTheDocument();
  });
});
