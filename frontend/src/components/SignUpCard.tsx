"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z
	.object({
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['student', 'faculty', 'admin']),
		email: z.string().email("Invalid email address."),
		password: z
			.string()
			.min(4, "Password must be at least 4 characters.")
			.max(32, "Password must be at most 32 characters."),
		passwordConfirm:
      z.string(),
	})
	.refine((values) => values.password === values.passwordConfirm, {
		message: "Passwords do not match.",
		path: ["passwordConfirm"],
	});

export default function SignUpCard() {
  // UI state for feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues:{
      firstName: "",
      lastName: "",
      role: "student",
      email: "",
      password: "",
      passwordConfirm: ""
    },
  })
  const router = useRouter();

  // Handles form submission and account creation
  async function handleSignUp(data: z.infer<typeof signupSchema>) {
    setError("");
    setLoading(true);

    try {
      // Send signup request to backend
      const res = await fetch("http://localhost:8000/api/v1/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          user_type: data.role,
        }),
      });
      const errorData = await res.json();

      // If successful, redirect user to landing or login page
      if (res.ok) {
        router.push("/");
      } else {
        // Display backend error message if available
        setError(
          typeof errorData.detail === "string"
            ? errorData.detail
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to start reserving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid sm:grid-cols-1 md:grid-cols-2" id="signup-form" onSubmit={form.handleSubmit(handleSignUp)}>
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState}) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-signup-first-name">First Name</FieldLabel>
                <Input
                {... field}
                id="form-signup-first-name"
                type="String"
                placeholder="Joe"
                aria-invalid={fieldState.invalid}
                required/>
                {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />)}
              </Field>
            )
          }/>
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState}) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-signup-last-name">Last Name</FieldLabel>
                <Input
                {... field}
                id="form-signup-last-name"
                type="String"
                placeholder="Smith"
                aria-invalid={fieldState.invalid}
                required/>
                {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />)}
              </Field>
            )
          }/>
          <Controller
            name="role"
            control={form.control}
            render={() => (
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="form-role">Role</FieldLabel>
              <Select defaultValue="student">
                <SelectTrigger id="form-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            )}/>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState}) => (
              <Field className='md:col-span-2' data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-signup-email">Email</FieldLabel>
                <Input
                {... field}
                id="form-signup-email"
                type="email"
                placeholder="joe.smith@example.com"
                aria-invalid={fieldState.invalid}
                required/>
                {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />)}
              </Field>
            )
          }/>
          <Controller
            name="password"
            control={form.control}
            render={({field, fieldState}) => (
              <Field className='md:col-span-2' data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-signup-password">Password</FieldLabel>
                <Input
                {... field}
                id="form-signup-password"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
                required/>
                {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />)}
              </Field>
            )
          }/>
          <Controller
            name="passwordConfirm"
            control={form.control}
            render={({field, fieldState}) => (
              <Field className='md:col-span-2' data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-signup-confirm-password">Confirm Password</FieldLabel>
                <Input
                {... field}
                id="form-signup-confirm-password"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
                required/>
                {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />)}
              </Field>
            )
          }/>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="signup-form" className="w-full">
          Sign Up
        </Button>
        <p className="text-sm text-muted-foreground">
          Already have an account? {" "}
          <a href="/" className="w-full">
            Sign in!
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}

export function InputInvalid() {
  return (
    <Field data-invalid>
      <FieldLabel htmlFor="input-invalid">Invalid Input</FieldLabel>
      <Input id="input-invalid" placeholder="Error" aria-invalid />
      <FieldDescription>
        This field contains validation errors.
      </FieldDescription>
    </Field>
  )
}

import { User, Mail, Lock, Eye, EyeOff, Link } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignUpCardOld() {
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
