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
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z
	.object({
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['Student', 'Faculty', 'Admin']),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues:{
      firstName: "",
      lastName: "",
      role: "Student",
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
              <Select defaultValue="Student">
                <SelectTrigger id="form-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
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
                <div className="flex">
                  <Input
                  {... field}
                  id="form-signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  aria-invalid={fieldState.invalid}
                  required/>
                  <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
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
                <FieldLabel className="flex" htmlFor="form-signup-confirm-password">Confirm Password</FieldLabel>
                <div className="flex">
                  <Input
                    {... field}
                    id="form-signup-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="********"
                    aria-invalid={fieldState.invalid}
                    required/>
                <Button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 bg-transparent"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                </Button>
                </div>
                {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />)}
              </Field>
            )
          }/>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="signup-form"
          disabled={loading}
          className="w-full bg-[#C41230] text-white font-semibold py-3 rounded-lg hover:bg-red-800 transition disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
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
