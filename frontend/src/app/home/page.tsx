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

type User = {
  id: number;
  name: string;
  email: string;
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

type EditDraft = {
  purpose: string;
  start_time: string;
  end_time: string;
};

function toDatetimeLocal(iso: string) {
  return iso.slice(0, 16);
}

export default function HomePage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("You must be logged in to view reservations.");
      return;
    }

    fetch("http://127.0.0.1:8000/api/v1/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {});

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

  async function handleDelete(id: number) {
    await fetch(`http://127.0.0.1:8000/api/v1/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setReservations((prev) => prev.filter((r) => r.id !== id));
    setCancellingId(null);
  }

  function startEditing(res: Reservation) {
    setEditingId(res.id);
    setEditDraft({
      purpose: res.purpose,
      start_time: toDatetimeLocal(res.start_time),
      end_time: toDatetimeLocal(res.end_time),
    });
  }

  async function handleSave(id: number) {
    if (!editDraft) return;

    //make sure start time is before end time
    const start = new Date(editDraft.start_time);
    const end = new Date(editDraft.end_time);
    const now = new Date();

    if (start < now) {
      setError("Start time cannot be in the past.");
      return;
    }

    if (end < now) {
      setError("End time cannot be in the past.");
      return;
    }

    if (start >= end) {
      setError("Start time must be before end time");
      return;
    }

    /* TODO: check if room reservation is available -- pull room of reservation, and obtain all the reservations */

    setSaving(true);

    const params = new URLSearchParams({
      purpose: editDraft.purpose,
      start_time: editDraft.start_time,
      end_time: editDraft.end_time,
    });
    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/reservations/${id}?${params}`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const updated: Reservation = await res.json();
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
      setEditDraft(null);
    }
    setSaving(false);
  }

  // Show only 3 most recent
  const recentReservations = reservations.slice(0, 3);

  return (
    <main className="bg-transparent text-foreground min-h-screen pt-6 px-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Main section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-foreground">My Reservations</h1>
            <Button asChild className="bg-[#C41230] hover:bg-[#a80f29] text-white gap-2">
              <Link href="/reservations">
                <Plus className="w-4 h-4" />
                New Reservation
              </Link>
            </Button>
          </div>

          {loading && (
            <p className="text-muted-foreground text-sm">Loading reservations...</p>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-5 text-red-600 text-sm">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && reservations.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                You have no reservations yet.{" "}
                <Link href="/reservations" className="text-[#C41230] hover:underline font-medium">
                  Create one now.
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {recentReservations.map((res) => (
              <Card key={res.id} className="shadow-sm">
                {editingId === res.id && editDraft ? (
                  /* ── Edit mode ── */
                  <CardContent className="px-6 py-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#C41230]" />
                      <span className="text-base font-semibold text-card-foreground">Room {res.room_id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground font-medium">Purpose</label>
                      <input
                        // className="border rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#C41230]"
                        className="border border-input bg-transparent text-foreground rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                        value={editDraft.purpose}
                        onChange={(e) => setEditDraft({ ...editDraft, purpose: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-muted-foreground font-medium">Start</label>
                        <input
                          type="datetime-local"
                          className="border border-input bg-transparent text-foreground rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editDraft.start_time}
                          onChange={(e) => setEditDraft({ ...editDraft, start_time: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-muted-foreground font-medium">End</label>
                        <input
                          type="datetime-local"
                          className="border border-input bg-transparent text-foreground rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                          onChange={(e) => setEditDraft({ ...editDraft, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        disabled={saving}
                        className="bg-[#C41230] hover:bg-[#a80f29] text-white"
                        onClick={() => handleSave(res.id)}
                      >
                        {saving ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingId(null); setEditDraft(null); }}
                      >
                        Discard
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  /* ── View mode ── */
                  <CardContent className="flex items-center px-6 py-5">
                    {/* Room + purpose */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-[#C41230]" />
                        <h2 className="text-base font-semibold text-foreground">Room {res.room_id}</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">{res.purpose}</p>
                    </div>

                    {/* Date + time */}
                    <div className="flex flex-col gap-1 w-64 items-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4 text-[#C41230]" />
                        {formatDate(res.start_time)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-[#C41230]" />
                        {formatTime(res.start_time)} – {formatTime(res.end_time)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-1 justify-end">
                      <Button variant="outline" size="sm" onClick={() => startEditing(res)}>
                        Edit
                      </Button>
                      {cancellingId === res.id ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-[#C41230] hover:bg-[#a80f29] text-white"
                            onClick={() => handleDelete(res.id)}
                          >
                            Confirm
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setCancellingId(null)}>
                            No
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#C41230] text-[#C41230] hover:bg-red-50"
                          onClick={() => setCancellingId(res.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
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
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{user?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Reservations</p>
                <p className="font-medium text-foreground">{reservations.length}</p>
              </div>
              <Separator />
              <Button asChild variant="outline" className="w-full text-[#C41230] border-[#C41230] hover:bg-red-50">
                <Link href="/account/edit">Edit Account Information</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/reservations">View All Reservations</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

      </div>
    </main>
  );
}
