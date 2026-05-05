"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, Building2, Search, Users, Mic, Monitor, Radio, Cpu, SquareStack, Tv, Laptop, Key, RotateCcw } from "lucide-react";
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
  room_num: string;
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

  const [rooms, setRooms] = useState<Room[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minCapacity, setMinCapacity] = useState<string>("");
  const [requiredFeatures, setRequiredFeatures] = useState<string[]>([]);
  const [availFrom, setAvailFrom] = useState("");
  const [availTo, setAvailTo] = useState("");
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomReservations, setRoomReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(false);

  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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
        const roomList = Array.isArray(data) ? data : data.rooms ?? data.items ?? [];
        setRooms(roomList);
        const uniqueBuildings = [...new Set(roomList.map((r: Room) => r.building))].sort();
        setBuildings(uniqueBuildings as string[]);
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
    if (!selectedRoom) return;
    setResLoading(true);
    setRoomReservations(allReservations.filter((r) => r.room_id === selectedRoom.id));
    setResLoading(false);
  }, [selectedRoom, allReservations]);

  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.trim().toLowerCase();
    const fullName = BUILDING_NAMES[room.building] ?? "";
    const matchesSearch = query
      ? room.building.toLowerCase().includes(query) ||
        room.room_num.toLowerCase().includes(query) ||
        fullName.toLowerCase().includes(query) ||
        room.features?.join(" ").toLowerCase().includes(query)
      : true;
    const matchesBuilding = selectedBuilding ? room.building === selectedBuilding : true;
    const matchesCapacity = minCapacity ? room.capacity >= parseInt(minCapacity) : true;
    const matchesFeature = requiredFeatures.every((f) => room.features?.includes(f));
    const matchesAvailability = isRoomAvailable(room, allReservations, availFrom, availTo);
    return matchesSearch && matchesBuilding && matchesCapacity && matchesFeature && matchesAvailability;
  });

  const handleBooking = async () => {
    if (!selectedRoom || !purpose || !startTime || !endTime) {
      setSubmitError("Please fill in all fields.");
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
      setStartTime("");
      setEndTime("");
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

  const hasActiveFilters = !!(searchQuery || selectedBuilding || minCapacity || requiredFeatures.length > 0 || availFrom || availTo);

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
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs text-[#C41230] hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset all
                    </button>
                  )}
                </div>

                {/* Search */}
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

                {/* Building */}
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

                {/* Min capacity */}
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

                {/* Date range */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date Range</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400">From</span>
                      <Input
                        type="datetime-local"
                        value={availFrom}
                        onChange={(e) => setAvailFrom(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400">To</span>
                      <Input
                        type="datetime-local"
                        value={availTo}
                        onChange={(e) => setAvailTo(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features */}
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
                onClick={() => {
                  setSelectedRoom(room);
                  setSubmitSuccess(false);
                  setSubmitError(null);
                }}
                className={`shadow-sm cursor-pointer transition-all border-2 ${
                  selectedRoom?.id === room.id
                    ? "border-[#C41230] bg-red-50"
                    : "border-transparent hover:border-gray-200 hover:shadow-md"
                }`}
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
                              <span
                                key={f}
                                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200"
                              >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoom(room);
                        setSubmitSuccess(false);
                        setSubmitError(null);
                      }}
                      variant="outline"
                      className={`shrink-0 ${
                        selectedRoom?.id === room.id
                          ? "bg-[#C41230] hover:bg-[#a80f29] text-white border-[#C41230]"
                          : "border-[#C41230] text-[#C41230] bg-white hover:bg-red-50"
                      }`}
                    >
                      {selectedRoom?.id === room.id ? "Selected" : "Book Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* ── RIGHT: Booking panel ── */}
          <aside className="flex flex-col gap-4 sticky top-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#C41230]" />
                  <CardTitle className="text-base">
                    {selectedRoom ? `Book ${selectedRoom.building} ${selectedRoom.room_num}` : "Your Selection"}
                  </CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 flex flex-col gap-4">
                {!selectedRoom ? (
                  <div className="text-center py-6">
                    <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-600">No room selected</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Select a room from the list to view details and book.</p>
                    <Button variant="outline" className="w-full text-[#C41230] border-red-100 bg-red-50 hover:bg-red-100">
                      Select a Room
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        placeholder="e.g. Study Group, Project Meeting"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="start">Start Time</Label>
                      <Input
                        id="start"
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="end">End Time</Label>
                      <Input
                        id="end"
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>

                    {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                    {submitSuccess && <p className="text-sm text-green-600">Reservation created successfully!</p>}

                    <Button
                      onClick={handleBooking}
                      disabled={submitting}
                      className="bg-[#C41230] hover:bg-[#a80f29] text-white w-full"
                    >
                      {submitting ? "Booking..." : "Confirm Reservation"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions — always visible */}
            {!selectedRoom && (
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-5 flex flex-col gap-1">
                  <p className="font-semibold text-gray-800 text-sm mb-2">Quick Actions</p>
                  <a href="/" className="flex items-center justify-between px-1 py-2.5 rounded-md hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">My Reservations</span>
                    </div>
                    <span className="text-gray-300 group-hover:text-gray-500 text-base">›</span>
                  </a>
                  <Separator />
                  <a href="/rooms" className="flex items-center justify-between px-1 py-2.5 rounded-md hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Browse All Rooms</span>
                    </div>
                    <span className="text-gray-300 group-hover:text-gray-500 text-base">›</span>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Tips — always visible when no room selected */}
            {!selectedRoom && (
              <Card className="shadow-sm bg-red-50 border-red-100">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#C41230] text-base">💡</span>
                    <p className="font-semibold text-gray-800 text-sm">Tips</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Use filters to quickly find a room that fits your needs.</p>
                  <p className="text-xs text-gray-500">You can also filter by capacity, building, or required features.</p>
                </CardContent>
              </Card>
            )}

            {selectedRoom && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Existing Bookings</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {resLoading && <p className="text-sm text-gray-500">Loading...</p>}
                  {!resLoading && roomReservations.length === 0 && (
                    <p className="text-sm text-gray-400">No existing bookings for this room.</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {roomReservations.map((res) => (
                      <div key={res.id} className="text-sm border border-gray-200 rounded-lg px-4 py-3">
                        <p className="font-medium text-gray-700">{res.purpose}</p>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <CalendarDays className="w-3.5 h-3.5 text-[#C41230]" />
                          {formatDate(res.start_time)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#C41230]" />
                          {formatTime(res.start_time)} – {formatTime(res.end_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

        </div>
      </div>
    </main>
  );
}
