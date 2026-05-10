import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
    it("shows the page heading", () => {
        render(<AboutPage />);

        expect(
            screen.getByRole("heading", { level: 2, name: /About Campus Classroom/i })
        ).toBeInTheDocument();
    })

    it("shows the sub-headings", () => {
        render(<AboutPage />);

        expect(
            screen.getByRole("heading", { level: 3, name: /Why this exists/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { level: 3, name: /What you can do/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { level: 3, name: /Who it's for/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { level: 3, name: /Our goal/i })
        ).toBeInTheDocument();
    });
});
