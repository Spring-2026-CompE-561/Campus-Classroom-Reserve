"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Building2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Reservation = {
  id: number;
  room_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  purpose: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomePage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("You must be logged in to view reservations.");
      return;
    }

    fetch("http://127.0.0.1:8000/api/v1/reservations/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reservations.");
        return res.json();
      })
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Show only 3 most recent
  const recentReservations = reservations.slice(0, 3);

  return (
    <main className="bg-gray-100 min-h-screen pt-6 px-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Main section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
            <Button asChild className="bg-[#C41230] hover:bg-[#a80f29] text-white gap-2">
              <Link href="/make-reservation">
                <Plus className="w-4 h-4" />
                New Reservation
              </Link>
            </Button>
          </div>

          {loading && (
            <p className="text-gray-500 text-sm">Loading reservations...</p>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-5 text-red-600 text-sm">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && reservations.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500 text-sm">
                You have no reservations yet.{" "}
                <Link href="/make-reservation" className="text-[#C41230] hover:underline font-medium">
                  Create one now.
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {recentReservations.map((res) => (
              <Card key={res.id} className="shadow-sm">
                <CardContent className="flex items-center px-6 py-5">

                  {/* Room + purpose */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-[#C41230]" />
                      <h2 className="text-base font-semibold text-gray-800">
                        Room {res.room_id}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500">{res.purpose}</p>
                  </div>

                  {/* Date + time */}
                  <div className="flex flex-col gap-1 w-64 items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4 text-[#C41230]" />
                      {formatDate(res.start_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#C41230]" />
                      {formatTime(res.start_time)} – {formatTime(res.end_time)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-1 justify-end">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#C41230] text-[#C41230] hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

          {/* View all link */}
          {reservations.length > 3 && (
            <div className="mt-4 text-center">
              <Link href="/reservations" className="text-sm text-[#C41230] hover:underline font-medium">
                View all {reservations.length} reservations →
              </Link>
            </div>
          )}
        </section>

        {/* Account info sidebar */}
        <aside>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-800">Student User</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-800">student@sdsu.edu</p>
              </div>
              <div>
                <p className="text-gray-500">Total Reservations</p>
                <p className="font-medium text-gray-800">{reservations.length}</p>
              </div>
              <Separator />
              <Button asChild variant="outline" className="w-full text-[#C41230] border-[#C41230] hover:bg-red-50">
                <Link href="/reservations">View All Reservations</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

      </div>
    </main>
  );
}
