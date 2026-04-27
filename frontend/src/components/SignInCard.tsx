"use client";
import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const success = await login(username, password);

    setLoading(false);

    if (success) {
      router.push("/home");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="w-[360px] bg-white rounded-xl overflow-hidden shadow-lg flex-shrink-0" style={{ height: "580px", overflowY: "auto" }}>

      {/* Header */}
      <div className="bg-[#1a1a1a] px-7 py-6">
        <h2 className="text-white text-2xl font-bold">Sign In</h2>
        <div className="w-8 h-1 bg-[#C41230] mt-2 rounded" />
      </div>

      {/* Body */}
      <div className="px-7 py-6 flex flex-col gap-4">

        {/* Username */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Sign In button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#C41230] text-white font-semibold py-3 rounded-lg hover:bg-red-800 transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Sign Up */}
        <div className="text-center pt-1">
          <p className="text-sm text-gray-500 mb-3">Don&apos;t have an account?</p>
          <Link href="/signup" className="w-full block border border-[#C41230] text-[#C41230] font-semibold py-3 rounded-lg hover:bg-red-50 transition text-center text-sm">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}