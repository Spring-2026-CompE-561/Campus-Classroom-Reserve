"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Building2, CalendarPlus, Info, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

const publicLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rooms", label: "Rooms", icon: Building2 },
  { href: "/about", label: "About", icon: Info },
];

const privateLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/reservations", label: "Make a Reservation", icon: CalendarPlus },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const { theme, setTheme } = useTheme()

  const links = isLoggedIn ? privateLinks : publicLinks;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="px-6 pt-4">
      <div className="rounded-2xl overflow-hidden shadow-lg">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-black to-zinc-900 px-8 py-5 flex items-center justify-between">

          {/* Logo - links back to landing page */}
          <Link href="/" className="min-w-[320px] flex items-center">
            <Image
              src="/SDSU_LOGO.png"
              alt="SDSU Logo"
              width={320}
              height={80}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex-1 text-center">
            <h1 className="bg-linear-to-r from-red-300 via-red-500 to-red-700 text-3xl bg-clip-text font-extrabold leading-tight tracking-tight text-transparent border-white">
              SDSU Campus Classroom Reserve
            </h1>
          </div>

          <div className="min-w-[320px]" />
        </div>

        {/* NAV */}
        <nav className="bg-[#C41230] flex">
          {links.map(({ href, label, icon: Icon }, i) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white
                  transition
                  ${isActive ? "bg-black/20" : "hover:bg-black/20"}
                  ${i < links.length - 1 ? "border-r border-white/10" : ""}
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}

          {/* Logout button - only shown when logged in */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white border-l border-white/10 hover:bg-black/20 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
          <Button className="flex py-5 bg-transparent border-none hover:bg-black/20 active:bg-black/30" variant="outline" size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" color="white" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>


      </div>
    </div>
  );
}
