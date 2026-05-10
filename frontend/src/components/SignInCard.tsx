"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";

const signinSchema = z.object({
	email: z.string().email("Invalid email address."),
	password: z
		.string()
		.min(4, "Password must be at least 4 characters.")
		.max(32, "Password must be at most 32 characters."),
});

export default function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { login } = useAuth();

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLogin = async (data: z.infer<typeof signinSchema>) => {
    setError("");
    setLoading(true);

    const success = await login(data.email, data.password);

    setLoading(false);

    if (success) {
      //HANDLE REDIRECT + ROOM ID
      const redirect = searchParams.get("redirect") || "/home";
      const roomId = searchParams.get("roomId");

      router.push(roomId ? `${redirect}?roomId=${roomId}` : redirect);
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="w-[360px] bg-white rounded-xl overflow-hidden shadow-lg flex-shrink-0" style={{ overflowY: "auto" }}>
      <Card className="w-full max-w-sm h-full flex flex-col justify-between">
        
        <CardHeader className="bg-[#1a1a1a] px-7 py-6">
          <CardTitle className="text-white text-2xl font-bold">Sign In</CardTitle>
          <div className="w-8 h-1 bg-[#C41230] mt-2 rounded" />
        </CardHeader>

        <CardContent className="px-7 py-6 flex-center gap-4">
          <form id="signup-form" onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState}) => (
                <Field className='' data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-medium text-gray-700 block mb-1" htmlFor="form-signup-email">Username</FieldLabel>
                  <Input
                  {... field}
                    id="form-signup-email"
                    type="email"
                    placeholder="joe.smith@example.com"
                    aria-invalid={fieldState.invalid}
                    required
                  />
                  {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({field, fieldState}) => (
                <Field className='py-4' data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-medium text-gray-700 block mb-1" htmlFor="form-signup-password">Password</FieldLabel>
                  <div className="flex">
                    <Input
                      {... field}
                      id="form-signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      aria-invalid={fieldState.invalid}
                      className="flex-1 text-sm outline-none bg-transparent"
                      required
                    />
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
                  {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                </Field>
              )}
            />

            {error && (
              <Card className="border-red-200 py-4 bg-red-50">
                <CardContent className="text-red-600 text-sm">{error}</CardContent>
              </Card>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2 pb-6">
          <Button
            type="submit"
            form="signup-form"
            disabled={loading}
            className="w-full bg-[#C41230] text-white font-semibold py-3 rounded-lg hover:bg-red-800 transition disabled:opacity-60"
          >
            {loading ? "Sigining In..." : "Sign In"}
          </Button>

          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account? {" "}
            {/* <a href="/signup" className="w-full"> Sign Up</a> */}
            <a href={`/signup?${searchParams.toString()}`}>Sign Up</a>
          </p>
        </CardFooter>
      
      </Card>
    </div>
  );
}
