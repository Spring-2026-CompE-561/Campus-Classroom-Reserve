"use client";

import Image from "next/image";
import Link from "next/link";
import SignInCard from "@/components/SignInCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensures the component is mounted before checking auth
  // Helps avoid hydration issues in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // If the user is logged in, redirect them to the home page
  useEffect(() => {
    if (mounted && isLoggedIn) {
      router.replace("/home");
    }
  }, [mounted, isLoggedIn, router]);

  // Don't render anything until mount is complete
  // Also prevent showing this page if already logged in
  if (!mounted) return null;
  if (isLoggedIn) return null;

  return (
    <main className="bg-white py-6 px-8">
      <div className="w-full flex gap-6 items-start">

        {/* Left side: main image with overlay text */}
        <div
          className="relative rounded-xl overflow-hidden flex-[3]"
          style={{ height: "580px" }}
        >
          <Image
            src="/hepner_hall.png"
            alt="Hepner Hall SDSU"
            fill
            className="object-cover"
            quality={100}
            priority
          />

          {/* Overlay content on image */}
          <div className="absolute bottom-8 left-8 bg-black/70 rounded-xl p-6 max-w-xs">
            <h2 className="text-white text-3xl font-bold leading-tight">
              Reserve Classrooms.<br />Support Learning.
            </h2>

            <div className="w-12 h-1 bg-[#C41230] my-3 rounded" />

            <p className="text-gray-300 text-sm">
              Easily find and reserve classrooms across SDSU.
            </p>

            {/* Link to browse available rooms */}
            <Link
              href="/rooms"
              className="mt-4 inline-block bg-[#C41230] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-red-800 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right side: sign-in form */}
        <SignInCard />
      </div>
    </main>
  );
}