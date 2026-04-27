"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpCard() {
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form input state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("Student");

  // UI state for feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Handles form submission and account creation
  const handleSignUp = async () => {
    setError("");

    // Basic validation: ensure passwords match
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Send signup request to backend
      const res = await fetch("http://localhost:8000/api/v1/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          password,
          user_type: role,
        }),
      });

      const data = await res.json();

      // If successful, redirect user to landing or login page
      if (res.ok) {
        router.push("/");
      } else {
        // Display backend error message if available
        setError(
          typeof data.detail === "string"
            ? data.detail
            : "Something went wrong."
        );
      }
    } catch (err) {
      // Handle network or unexpected errors
      setError("Could not connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="w-[560px] bg-white rounded-xl overflow-hidden shadow-2xl">

      {/* Card header */}
      <div className="bg-[#1a1a1a] px-8 py-5">
        <h2 className="text-white text-2xl font-bold">Sign Up</h2>
        <div className="w-8 h-1 bg-[#C41230] mt-2 rounded" />
      </div>

      {/* Card body */}
      <div className="px-8 py-4 flex flex-col gap-3">

        {/* First and last name fields */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              First Name
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent min-w-0"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Last Name
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Email field */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Email
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Password and confirm password fields */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent min-w-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent min-w-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Role selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-transparent text-gray-500"
          >
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Error message display */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Submit button */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-[#C41230] text-white font-semibold py-3 rounded-lg hover:bg-red-800 transition disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {/* Redirect to sign-in */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Already have an account?
          </p>
          <a
            href="/"
            className="w-full block border border-[#C41230] text-[#C41230] font-semibold py-2.5 rounded-lg hover:bg-red-50 transition text-center text-sm"
          >
            Sign In
          </a>
        </div>

      </div>
    </div>
  );
}