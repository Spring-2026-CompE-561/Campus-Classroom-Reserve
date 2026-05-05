"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const editSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function EditAccountPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/v1/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUserId(data.id);
        form.reset({ name: data.name, email: data.email });
      });
  }, [token, form]);

  async function handleSave(data: EditFormValues) {
    if (!token || userId === null) return;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ name: data.name, email: data.email });

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/user/${userId}?${params}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        router.push("/home");
      } else {
        const body = await res.json();
        setError(
          typeof body.detail === "string" ? body.detail : "Update failed."
        );
      }
    } catch {
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  return (
    <main className="bg-gray-100 min-h-screen pt-6 px-8 pb-10">
      <div className="max-w-md mx-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Edit Account Information</CardTitle>
            <CardDescription>Update your name and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="edit-account-form"
              onSubmit={form.handleSubmit(handleSave)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-name">Full Name</FieldLabel>
                    <Input
                      {...field}
                      id="edit-name"
                      placeholder="Joe Smith"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="edit-email"
                      type="email"
                      placeholder="joe.smith@sdsu.edu"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="submit"
              form="edit-account-form"
              disabled={loading}
              className="bg-[#C41230] hover:bg-[#a80f29] text-white flex-1"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/home")}
              className="flex-1"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
