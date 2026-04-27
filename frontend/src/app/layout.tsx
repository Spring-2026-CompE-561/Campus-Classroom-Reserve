import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en">
      <body className="bg-gray-100">
        {/* 
          AuthProvider wraps the entire app
          so auth state is available everywhere
        */}
        <AuthProvider>
          {/* Top navigation bar */}
          <Navbar />

          {/* Page content */}
          <main>{children}</main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}