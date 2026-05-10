"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
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
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
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
  { key: "microphone", label: "PA Microphone", icon: Mic },
  { key: "zoom_ready", label: "Zoom Ready", icon: Monitor },
  { key: "automated_capture", label: "Automated Capture", icon: Radio },
  { key: "touchlink", label: "TouchLink Control", icon: Cpu },
  { key: "control_panel", label: "Control Panel", icon: SquareStack },
  { key: "hdmi", label: "HDMI", icon: Tv },
  { key: "laptop_ready", label: "Laptop Ready", icon: Laptop },
  { key: "key_required", label: "Podium Requires Key", icon: Key },
];

const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  FEATURE_META.map(({ key, label }) => [key, label])
);

const FEATURE_ICONS: Record<string, any> = Object.fromEntries(
  FEATURE_META.map(({ key, icon }) => [key, icon])
);

type Room = {
  id: number;
  building: string;
  room_num: string | number;
  capacity: number;
  features: string[];
};

export default function RoomsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [requiredFeatures, setRequiredFeatures] = useState<string[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // If user is signed in, they should use the reservation page instead.
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/reservations");
    }
  }, [isLoggedIn, router]);

  // Public browse rooms fetch
  useEffect(() => {
    if (isLoggedIn) return;

    fetch("http://127.0.0.1:8000/api/v1/rooms/")
      .then((res) => res.json())
      .then((data: any) => {
        const roomList: Room[] = Array.isArray(data)
          ? data
          : data.rooms ?? data.items ?? [];

        setRooms(roomList);

        const uniqueBuildings = Array.from(
          new Set<string>(roomList.map((r) => String(r.building ?? "")))
        )
          .filter(Boolean)
          .sort();

        setBuildings(uniqueBuildings);
        setRoomsLoading(false);
      })
      .catch(() => setRoomsLoading(false));
  }, [isLoggedIn]);

  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.trim().toLowerCase();

    const buildingName = BUILDING_NAMES[String(room.building ?? "")] ?? "";

    const fullRoomName = `${room.building} ${room.room_num}`.toLowerCase();

    const matchesSearch = query
      ? fullRoomName.includes(query) ||
        buildingName.toLowerCase().includes(query) ||
        String(room.room_num ?? "").toLowerCase().includes(query) ||
        (room.features ?? []).join(" ").toLowerCase().includes(query)
      : true;

    const matchesBuilding = selectedBuilding
      ? room.building === selectedBuilding
      : true;

    const matchesCapacity = minCapacity
      ? room.capacity >= Number(minCapacity)
      : true;

    const matchesFeatures = requiredFeatures.every((f) =>
      room.features?.includes(f)
    );

    return matchesSearch && matchesBuilding && matchesCapacity && matchesFeatures;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBuilding("");
    setMinCapacity("");
    setRequiredFeatures([]);
  };

  const hasActiveFilters =
    searchQuery || selectedBuilding || minCapacity || requiredFeatures.length > 0;

  if (isLoggedIn) {
    return null;
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Browse Rooms</h1>

        <p className="text-sm text-muted-foreground mb-6">
          Browse classrooms across campus. Sign in to reserve a room.
        </p>

        <div className="grid grid-cols-[260px_1fr] gap-6 items-start">
          <aside>
            <Card className="shadow-sm sticky top-6">
              <CardContent className="pt-5 pb-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Filters
                  </span>

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

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Building
                  </Label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  >
                    <option value="">All Buildings</option>
                    {buildings.map((b) => (
                      <option key={b} value={b}>
                        {BUILDING_NAMES[b] ? `${b} — ${BUILDING_NAMES[b]}` : b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Min Capacity
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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

                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Features
                  </Label>

                  {FEATURE_META.map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={requiredFeatures.includes(key)}
                          onChange={(e) => {
                            setRequiredFeatures((prev) =>
                              e.target.checked
                                ? [...prev, key]
                                : prev.filter((f) => f !== key)
                            );
                          }}
                          className="accent-[#C41230] w-3.5 h-3.5"
                        />
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-card-foreground group-hover:text-card-foreground">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {rooms.filter((r) => r.features?.includes(key)).length}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="flex flex-col gap-3">
            <div className="px-1">
              <p className="text-sm text-muted-foreground">
                {roomsLoading
                  ? "Loading rooms..."
                  : `${filteredRooms.length} room${
                      filteredRooms.length !== 1 ? "s" : ""
                    } found`}
              </p>
            </div>

            {!roomsLoading && filteredRooms.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
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
                        <h2 className="font-semibold text-card-foreground text-base">
                          {room.building} {room.room_num}
                        </h2>

                        {BUILDING_NAMES[room.building] && (
                          <span className="text-sm text-muted-foreground">
                            {BUILDING_NAMES[room.building]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
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
                                {FEATURE_LABELS[f] ?? f}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => router.push(`/?redirect=/reservations&roomId=${room.id}`)}
                      variant="outline"
                      className="shrink-0 border-[#C41230] text-[#C41230] bg-white hover:bg-red-50"
                    >
                      Sign in to Reserve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}