import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// mock router + search params
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
    toString: () => "",
  }),
}));

// mock auth
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(() => Promise.resolve(false)), // simulate failed login
  }),
}));

import SignInCard from "@/components/SignInCard";

describe("SignInCard", () => {
  it("renders email and password fields", () => {
    render(<SignInCard />);

    expect(screen.getByPlaceholderText(/joe.smith@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    render(<SignInCard />);

    fireEvent.change(screen.getByPlaceholderText(/joe.smith@example.com/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<SignInCard />);

    const passwordInput = screen.getByPlaceholderText("********");

    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getAllByRole("button")[0];
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});