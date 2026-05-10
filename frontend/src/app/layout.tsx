import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


// Load and configure fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Page metadata (used by Next.js for SEO and tab title)
export const metadata: Metadata = {
  title: "Campus Classroom Reserve",
  description: "A classroom reservation app built with Next.js 16 and TypeScript.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      {/* <body className="bg-transparent min-h-screen flex flex-col"> */}
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        {/*
          AuthProvider wraps the entire app
          so auth state is available everywhere
        */}
        <AuthProvider>
          {/* Top navigation bar */}
          <Navbar />

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
