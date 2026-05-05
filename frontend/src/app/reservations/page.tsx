"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Building2,
  Search,
  Users,
  Mic,
  Monitor,
  Radio,
  Cpu,
  SquareStack,
  Tv,
  Laptop,
  Key,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const BUILDING_NAMES: Record<string, string> = {
  AL: "Arts & Letters",
  AH: "Adams Humanities",
  A: "Art",
  BT: "Bernstein Theater",
  COM: "Communications",
  E: "Engineering",
  ENS: "Engineering & Interdisciplinary Sciences",
  FAC: "Fowler Athletics Center",
  GMCS: "Geology, Math, & Computer Science",
  HH: "Hepner Hall",
  HT: "Hardy Tower",
  LH: "Lamden Hall",
  LL: "Love Library",
  LSN: "Life Sciences North",
  LSS: "Life Sciences South",
  M: "Music",
  NE: "North Education",
  OP: "Ochoa Pavillion",
  P: "Physics",
  PG: "Peterson Gym",
  PS: "Physical Sciences",
  PSFA: "Professional Studies & Fine Arts",
  SH: "Storm Hall",
  SHW: "Storm Hall West",
  SLHS: "Speech, Language, & Hearing Sciences",
  SSE: "Social Services East",
  SSW: "Social Services West",
};

const FEATURE_META = [
  { key: "microphone",        label: "PA Microphone",       icon: Mic },
  { key: "zoom_ready",        label: "Zoom Ready",          icon: Monitor },
  { key: "automated_capture", label: "Automated Capture",   icon: Radio },
  { key: "touchlink",         label: "TouchLink Control",   icon: Cpu },
  { key: "control_panel",     label: "Control Panel",       icon: SquareStack },
  { key: "hdmi",              label: "HDMI",                icon: Tv },
  { key: "laptop_ready",      label: "Laptop Ready",        icon: Laptop },
  { key: "key_required",      label: "Podium Requires Key", icon: Key },
];

const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  FEATURE_META.map(({ key, label }) => [key, label])
);
const FEATURE_ICONS: Record<string, any> = Object.fromEntries(
  FEATURE_META.map(({ key, icon }) => [key, icon])
);

function getBuildingLabel(code: string) {
  return BUILDING_NAMES[code] ? `${code} — ${BUILDING_NAMES[code]}` : code;
}

function formatFeature(f: string) {
  return FEATURE_LABELS[f] ?? f;
}

type Room = {
  id: number;
  building: string;
  room_num: string | number;
  capacity: number;
  features: string[];
};

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
    weekday: "short", month: "short", day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isRoomAvailable(room: Room, allReservations: Reservation[], from: string, to: string) {
  if (!from || !to) return true;
  const fromMs = new Date(from).getTime();
  const toMs = new Date(to).getTime();
  return !allReservations
    .filter((r) => r.room_id === room.id)
    .some((r) => {
      const start = new Date(r.start_time).getTime();
      const end = new Date(r.end_time).getTime();
      return fromMs < end && toMs > start;
    });
}

export default function ReservationsPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [requiredFeatures, setRequiredFeatures] = useState<string[]>([]);
  const [availFrom, setAvailFrom] = useState("");
  const [availTo, setAvailTo] = useState("");
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomReservations, setRoomReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(false);

  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTimeVal, setStartTimeVal] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTimeVal, setEndTimeVal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/v1/rooms/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: any) => {
        const roomList: Room[] = Array.isArray(data) ? data : data.rooms ?? data.items ?? [];
        setRooms(roomList);
        const uniqueBuildings = Array.from(new Set<string>(roomList.map((r) => String(r.building ?? ""))))
          .filter(Boolean).sort();
        setBuildings(uniqueBuildings);
        setRoomsLoading(false);
      })
      .catch(() => setRoomsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/v1/reservations/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Reservation[]) => setAllReservations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (!roomId || rooms.length === 0) return;
    const matchingRoom = rooms.find((room) => String(room.id) === roomId);
    if (matchingRoom) {
      setSelectedRoom(matchingRoom);
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [searchParams, rooms]);

  useEffect(() => {
    if (!selectedRoom) return;
    setResLoading(true);
    setRoomReservations(allReservations.filter((r) => r.room_id === selectedRoom.id));
    setResLoading(false);
  }, [selectedRoom, allReservations]);

  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.trim().toLowerCase();
    const buildingName = BUILDING_NAMES[String(room.building ?? "")] ?? "";
    const fullRoomName = `${String(room.building ?? "")} ${String(room.room_num ?? "")}`.toLowerCase();
    const matchesSearch = query
      ? fullRoomName.includes(query) || buildingName.toLowerCase().includes(query) ||
        String(room.room_num ?? "").toLowerCase().includes(query) ||
        (room.features ?? []).join(" ").toLowerCase().includes(query)
      : true;
    const matchesBuilding = selectedBuilding ? room.building === selectedBuilding : true;
    const matchesCapacity = minCapacity ? room.capacity >= parseInt(minCapacity) : true;
    const matchesFeature = requiredFeatures.every((f) => room.features?.includes(f));
    const matchesAvailability = isRoomAvailable(room, allReservations, availFrom, availTo);
    return matchesSearch && matchesBuilding && matchesCapacity && matchesFeature && matchesAvailability;
  });

  const handleBooking = async () => {
    if (!selectedRoom || !purpose || !startDate || !startTimeVal || !endDate || !endTimeVal) {
      setSubmitError("Please fill in all fields.");
      return;
    }
    const startTime = `${startDate}T${startTimeVal}`;
    const endTime = `${endDate}T${endTimeVal}`;
    if (new Date(startTime) > new Date(endTime)){
      setSubmitError("Start time must be after end time.");
      return;
    }
    if (!isRoomAvailable(selectedRoom, allReservations, startTime, endTime)){
      setSubmitError("Room is already booked during this time period");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/reservations/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room_id: selectedRoom.id,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          purpose,
        }),
      });
      if (!res.ok) throw new Error("Failed to create reservation.");
      setSubmitSuccess(true);
      setPurpose("");
      setStartDate("");
      setStartTimeVal("");
      setEndDate("");
      setEndTimeVal("");
      const updated = await fetch("http://127.0.0.1:8000/api/v1/reservations/", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      const updatedList = Array.isArray(updated) ? updated : [];
      setAllReservations(updatedList);
      setRoomReservations(updatedList.filter((r: Reservation) => r.room_id === selectedRoom.id));
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBuilding("");
    setMinCapacity("");
    setRequiredFeatures([]);
    setAvailFrom("");
    setAvailTo("");
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleBack = () => {
    setSelectedRoom(null);
    setPurpose("");
    setStartDate("");
    setStartTimeVal("");
    setEndDate("");
    setEndTimeVal("");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const hasActiveFilters = !!(searchQuery || selectedBuilding || minCapacity || requiredFeatures.length > 0 || availFrom || availTo);

  // ── DETAIL / BOOKING VIEW ──────────────────────────────────────────────────
  if (selectedRoom) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="px-4 py-4">
          {/* Rounded campus photo background — same as signup */}
          <div
            className="rounded-2xl overflow-hidden relative flex flex-col py-8"
            style={{
              backgroundImage: `url('/centennial-walkway-overlay.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="px-6 py-6 flex flex-col flex-1 items-center justify-center">
              <div className="w-full max-w-5xl">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mb-6 text-gray-700 bg-white/80 hover:bg-white border border-gray-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to rooms
                </Button>

              {/* Single wide card split into two columns */}
              <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-[320px_1fr] min-h-[600px]">

              {/* LEFT — room info */}
              <div className="border-r border-gray-100 p-5 flex flex-col gap-3">
                {/* Title */}
                <div>
                  <p className="text-[#C41230] text-sm font-semibold mb-0.5">Reserve</p>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedRoom.building} {selectedRoom.room_num}
                  </h1>
                  {BUILDING_NAMES[selectedRoom.building] && (
                    <p className="text-sm text-gray-400 mt-0.5">{BUILDING_NAMES[selectedRoom.building]}</p>
                  )}
                </div>

                <Separator />

                {/* Capacity */}
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#C41230] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Capacity</p>
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {selectedRoom.capacity} <span className="text-sm font-normal text-gray-400">people</span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                {selectedRoom.features?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <SquareStack className="w-4 h-4 text-[#C41230]" />
                      <p className="text-sm font-semibold text-gray-700">Features</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRoom.features.map((f) => {
                        const Icon = FEATURE_ICONS[f];
                        return (
                          <span key={f} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                            {Icon && <Icon className="w-3 h-3" />}
                            {formatFeature(f)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* About */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-[#C41230]" />
                    <p className="text-sm font-semibold text-gray-700">About this room</p>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Standard classroom in {BUILDING_NAMES[selectedRoom.building] ?? selectedRoom.building}.
                    Capacity of {selectedRoom.capacity} people
                    {selectedRoom.features?.length > 0 ? `. Equipped with ${selectedRoom.features.slice(0, 2).map(formatFeature).join(" and ")}.` : "."}
                  </p>
                </div>
              </div>

              {/* RIGHT — bookings + form */}
              <div className="p-5 flex flex-col gap-4">

                {/* Existing bookings */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-[#C41230]" />
                      <h2 className="text-sm font-semibold text-gray-800">Existing Bookings</h2>
                    </div>
                  </div>

                  {resLoading && <p className="text-sm text-gray-400">Loading...</p>}

                  {!resLoading && roomReservations.length === 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-75 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                      <CalendarDays className="w-4 h-4" />
                      No existing bookings for this room.
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {roomReservations.map((res) => (
                      <div key={res.id} className="flex items-start gap-4 border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition">
                        <div className="text-center min-w-[36px]">
                          <p className="text-xs font-semibold text-[#C41230] uppercase leading-none">
                            {new Date(res.start_time).toLocaleString("default", { month: "short" })}
                          </p>
                          <p className="text-xl font-bold text-gray-800 leading-tight">
                            {new Date(res.start_time).getDate()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{res.purpose}</p>
                          {formatDate(res.start_time) === formatDate(res.end_time) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(res.start_time)} · {formatTime(res.start_time)} – {formatTime(res.end_time)}
                          </p>)}
                          {formatDate(res.start_time) !== formatDate(res.end_time) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(res.start_time)} · {formatTime(res.start_time)} – {formatDate(res.end_time)} · {formatTime(res.end_time)}
                          </p>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Booking form */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-4 h-4 text-[#C41230]" />
                    <h2 className="text-sm font-semibold text-gray-800">Reservation Details</h2>
                  </div>

                  {submitSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-gray-800 mb-1">Reservation Confirmed!</p>
                      <p className="text-sm text-gray-500 mb-4">{selectedRoom.building} {selectedRoom.room_num} has been reserved.</p>
                      <Button variant="outline" onClick={() => setSubmitSuccess(false)} className="border-gray-300 text-gray-700">
                        Make another reservation
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Input
                          id="purpose"
                          placeholder="e.g. Study Group, Project Meeting, Club Meeting"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Start Date</Label>
                          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>Start Time</Label>
                          <Input type="time" value={startTimeVal} onChange={(e) => setStartTimeVal(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>End Date</Label>
                          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>End Time</Label>
                          <Input type="time" value={endTimeVal} onChange={(e) => setEndTimeVal(e.target.value)} />
                        </div>
                      </div>

                      {submitError && (
                        <div className="flex items-center gap-2 text-sm text-[#C41230] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <span>⚠</span> {submitError}
                        </div>
                      )}

                      <Button
                        onClick={handleBooking}
                        disabled={submitting}
                        className="bg-[#C41230] hover:bg-[#a80f29] text-white w-full h-11 font-semibold"
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {submitting ? "Confirming..." : "Confirm Reservation"}
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── ROOM LIST VIEW ─────────────────────────────────────────────────────────
  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Make a Reservation</h1>

        <div className="grid grid-cols-[260px_1fr_300px] gap-6 items-start">

          {/* ── LEFT: Filters sidebar ── */}
          <aside>
            <Card className="shadow-sm sticky top-6">
              <CardContent className="pt-5 pb-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">Filters</span>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-[#C41230] hover:underline">
                      <RotateCcw className="w-3 h-3" />
                      Reset all
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="Room, building, features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 text-sm h-9"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Building</Label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  >
                    <option value="">All Buildings</option>
                    {buildings.map((b) => (
                      <option key={b} value={b}>{getBuildingLabel(b)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Min Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 30"
                      value={minCapacity}
                      onChange={(e) => setMinCapacity(e.target.value)}
                      className="pl-8 text-sm h-9"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date Range</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400">From</span>
                      <Input type="datetime-local" value={availFrom} onChange={(e) => setAvailFrom(e.target.value)} className="text-sm h-9" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400">To</span>
                      <Input type="datetime-local" value={availTo} onChange={(e) => setAvailTo(e.target.value)} className="text-sm h-9" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Features</Label>
                  {FEATURE_META.map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={requiredFeatures.includes(key)}
                          onChange={(e) => {
                            setRequiredFeatures((prev) =>
                              e.target.checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                          }}
                          className="accent-[#C41230] w-3.5 h-3.5"
                        />
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {rooms.filter((r) => r.features?.includes(key)).length}
                      </span>
                    </label>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-1.5">
                  <Button
                    onClick={resetFilters}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  >
                    Reset Filters
                  </Button>
                </div>

              </CardContent>
            </Card>
          </aside>

          {/* ── CENTER: Room list ── */}
          <section className="flex flex-col gap-3">
            <div className="px-1">
              <p className="text-sm text-gray-500">
                {roomsLoading ? "Loading rooms..." : `${filteredRooms.length} room${filteredRooms.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {!roomsLoading && filteredRooms.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="py-10 text-center text-sm text-gray-400">
                  No rooms match your filters.
                </CardContent>
              </Card>
            )}

            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="shadow-sm transition-all border-2 border-transparent hover:border-gray-200 hover:shadow-md"
              >
                <CardContent className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-semibold text-gray-900 text-base">
                          {room.building} {room.room_num}
                        </h2>
                        {BUILDING_NAMES[room.building] && (
                          <span className="text-sm text-gray-400">{BUILDING_NAMES[room.building]}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                        <Users className="w-3.5 h-3.5 text-[#C41230]" />
                        Capacity: {room.capacity}
                      </div>
                      {room.features && room.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {room.features.map((f) => {
                            const Icon = FEATURE_ICONS[f];
                            return (
                              <span key={f} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                {Icon && <Icon className="w-3 h-3" />}
                                {formatFeature(f)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectRoom(room)}
                      variant="outline"
                      className="shrink-0 border-[#C41230] text-[#C41230] bg-white hover:bg-red-50"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* ── RIGHT: Quick actions + tips ── */}
          <aside className="flex flex-col gap-4 sticky top-6">
            <Card className="shadow-sm">
              <CardContent className="pt-5 pb-5 flex flex-col gap-1">
                <p className="font-semibold text-gray-800 text-sm mb-2">Quick Actions</p>
                <a href="/" className="flex items-center justify-between px-1 py-2.5 rounded-md hover:bg-gray-50 transition group">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">My Reservations</span>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-500 text-base">&#8250;</span>
                </a>
                <Separator />
                {/* <a href="/rooms" className="flex items-center justify-between px-1 py-2.5 rounded-md hover:bg-gray-50 transition group">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Browse All Rooms</span>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-500 text-base">›</span>
                </a> */}
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-red-50 border-red-100">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#C41230] text-base">💡</span>
                  <p className="font-semibold text-gray-800 text-sm">Tips</p>
                </div>
                <p className="text-xs text-gray-500 mb-2">Use filters to quickly find a room that fits your needs.</p>
                <p className="text-xs text-gray-500">You can filter by date, capacity, building, or required features.</p>
              </CardContent>
            </Card>
          </aside>

        </div>
      </div>
    </main>
  );
}
