"""
seed_rooms.py — Seed SDSU classrooms directly into SQLite
Source: SDSU IT Room Directory (https://it.sdsu.edu/classrooms-labs), Spring 2026

Features key:
  touchlink       — Touchlink Control
  control_panel   — Control Panel
  hdmi            — HDMI
  microphone      — Microphone System (PA Mic)
  key_required    — Podium requires key
  automated_capture — Automated Capture / Capture Ready
  zoom_ready      — Connected Classroom / Zoom Ready
  laptop_ready    — Laptop ready (no installed computers)

Run: python seed_rooms.py
     python seed_rooms.py --db path/to/campus_classroom_reserve.db
"""

import sqlite3
import json
import argparse

# (building, room_num, capacity, features)
ROOMS = [
    # ARTN — Art North
    # ("A",    "300B",  30,  ["touchlink", "hdmi", "zoom_ready"]),
    ("A",    "412",   70,  ["touchlink", "hdmi", "zoom_ready", "automated_capture"]),
    # ("A",    "512B",  40,  ["control_panel", "hdmi"]),

    # AH — Adams Humanities
    ("AH",   "2103",  42,  ["touchlink", "hdmi"]),
    ("AH",   "2107",  30,  ["touchlink", "hdmi"]),
    ("AH",   "2108",  150, ["touchlink", "hdmi", "key_required", "microphone", "zoom_ready", "automated_capture"]),
    ("AH",   "2111",  32,  ["control_panel", "key_required"]),
    ("AH",   "2112",  40,  ["control_panel"]),
    ("AH",   "2113",  41,  ["control_panel", "zoom_ready"]),
    ("AH",   "2116",  30,  ["control_panel"]),
    ("AH",   "2134",  30,  ["control_panel", "key_required"]),
    ("AH",   "3110",  60,  ["control_panel", "key_required"]),
    ("AH",   "3113",  50,  ["control_panel", "key_required"]),
    ("AH",   "3127",  30,  ["control_panel", "key_required"]),
    ("AH",   "3130",  30,  ["control_panel", "key_required"]),
    ("AH",   "3150",  30,  ["control_panel", "key_required"]),
    ("AH",   "3177",  60,  ["touchlink", "hdmi", "microphone", "automated_capture", "key_required"]),

    # AL — Arts and Letters
    ("AL",   "101",   108, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("AL",   "102",   60,  ["control_panel", "key_required"]),
    ("AL",   "104",   41,  ["touchlink", "hdmi"]),
    ("AL",   "105",   80,  ["touchlink", "hdmi", "microphone", "automated_capture", "key_required"]),
    ("AL",   "201",   500, ["touchlink", "hdmi", "microphone", "automated_capture", "key_required"]),
    ("AL",   "204",   60,  ["touchlink", "hdmi", "microphone"]),

    # BT — Bernstein Theatre
    ("BT",   "161",   185, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),

    # COM — Communications
    ("COM",  "105",   70,  ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("COM",  "205",   30,  ["control_panel", "key_required"]),
    ("COM",  "206",   45,  ["control_panel", "key_required"]),
    ("COM",  "207",   123, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),

    # E — Engineering
    ("E",    "201",   50,  ["touchlink", "hdmi", "automated_capture"]),
    ("E",    "300",   49,  ["control_panel", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("E",    "328",   49,  ["touchlink", "hdmi", "automated_capture"]),
    # ("E",    "423B",  52,  ["touchlink", "hdmi", "automated_capture"]),
    ("E",    "427",   40,  ["touchlink", "hdmi", "automated_capture"]),

    # ENS — Exercise and Nutritional Sciences
    ("ENS",  "106",   40,  ["control_panel", "key_required"]),
    ("ENS",  "280",   512, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("ENS",  "291",   75,  ["control_panel", "key_required", "microphone"]),

    # FAC — Fowler Athletic Center
    ("FAC",  "1014",  200, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),

    # GMCS — Geology, Math, and Computer Sciences
    ("GMCS", "301",   111, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("GMCS", "305",   40,  ["control_panel", "key_required"]),
    ("GMCS", "306",   40,  ["control_panel", "key_required"]),
    ("GMCS", "307",   40,  ["control_panel", "key_required"]),
    ("GMCS", "308",   40,  ["control_panel", "key_required"]),
    ("GMCS", "309",   60,  ["touchlink", "hdmi", "microphone"]),
    ("GMCS", "310",   60,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("GMCS", "313",   60,  ["touchlink", "hdmi", "microphone"]),
    ("GMCS", "314",   60,  ["touchlink", "hdmi", "microphone"]),
    ("GMCS", "324",   65,  ["control_panel", "key_required"]),
    ("GMCS", "325",   42,  ["control_panel", "key_required"]),
    ("GMCS", "327",   42,  ["control_panel", "key_required"]),
    ("GMCS", "328",   40,  ["touchlink", "hdmi"]),
    ("GMCS", "329",   42,  ["control_panel", "key_required"]),
    ("GMCS", "333",   300, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),

    # HH — Hepner Hall
    ("HH",   "122",   30,  ["control_panel", "hdmi"]),
    ("HH",   "128",   26,  ["control_panel", "key_required"]),
    ("HH",   "130",   170, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("HH",   "134",   40,  ["control_panel", "key_required"]),
    ("HH",   "146",   32,  ["control_panel", "key_required"]),
    ("HH",   "150",   40,  ["control_panel", "key_required"]),
    ("HH",   "206",   42,  ["control_panel", "key_required"]),
    ("HH",   "210",   42,  ["control_panel", "key_required"]),
    ("HH",   "214",   100, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("HH",   "216",   32,  ["touchlink", "hdmi"]),
    ("HH",   "218",   32,  ["control_panel", "hdmi"]),
    ("HH",   "221",   108, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("HH",   "222",   48,  ["control_panel", "key_required"]),

    # HT — Hardy Tower
    ("HT",   "022",   52,  ["control_panel", "hdmi"]),
    ("HT",   "140",   228, ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("HT",   "183",   98,  ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),

    # LH — Lamden Hall
    ("LH",   "245",   20,  ["control_panel", "hdmi"]),
    ("LH",   "247",   42,  ["touchlink", "hdmi"]),
    ("LH",   "249",   32,  ["control_panel", "hdmi"]),
    ("LH",   "251",   26,  ["control_panel", "hdmi"]),
    ("LH",   "254",   38,  ["control_panel", "hdmi"]),
    ("LH",   "256",   35,  ["control_panel", "key_required"]),
    ("LH",   "258",   35,  ["control_panel", "key_required"]),
    ("LH",   "260",   40,  ["control_panel", "key_required"]),
    ("LH",   "339",   68,  ["touchlink", "hdmi"]),
    ("LH",   "340",   40,  ["touchlink", "hdmi"]),
    ("LH",   "341",   50,  ["touchlink", "hdmi"]),
    ("LH",   "343",   90,  ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("LH",   "345",   80,  ["touchlink", "hdmi", "key_required", "microphone", "automated_capture"]),
    ("LH",   "347",   80,  ["touchlink", "hdmi", "microphone"]),
    ("LH",   "408",   49,  ["control_panel"]),
    ("LH",   "412",   40,  ["control_panel"]),
    ("LH",   "437",   70,  ["touchlink", "hdmi", "microphone"]),
    ("LH",   "439",   49,  ["control_panel"]),
    ("LH",   "441",   36,  ["touchlink", "hdmi"]),
    ("LH",   "442",   32,  ["control_panel", "hdmi"]),
    ("LH",   "443",   41,  ["touchlink", "hdmi"]),
    ("LH",   "445",   20,  ["touchlink", "hdmi", "laptop_ready"]),

    # LL — Love Library
    ("LL",   "408",   50,  ["control_panel", "key_required"]),

    # LSN — Life Sciences North
    ("LSN",  "111",   49,  ["touchlink", "hdmi"]),
    ("LSN",  "132",   49,  ["control_panel", "hdmi", "key_required"]),
    ("LSN",  "134",   49,  ["control_panel", "hdmi", "key_required"]),

    # LSS — Life Sciences South
    ("LSS",  "244",   45,  ["touchlink", "hdmi"]),
    ("LSS",  "246",   44,  ["touchlink", "hdmi"]),
    ("LSS",  "248",   75,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("LSS",  "365",   60,  ["touchlink", "hdmi"]),

    # M — Music
    ("M",    "120",   80,  ["touchlink", "hdmi"]),
    ("M",    "206",   40,  ["touchlink", "hdmi"]),
    ("M",    "207",   47,  ["control_panel", "key_required"]),
    ("M",    "215",   36,  ["touchlink", "hdmi"]),
    ("M",    "245",   65,  ["control_panel", "key_required"]),
    ("M",    "261",   47,  ["control_panel", "key_required"]),
    ("M",    "265",   70,  ["touchlink", "hdmi", "microphone"]),

    # NE — North Education
    ("NE",   "060",   167, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("NE",   "073",   44,  ["touchlink", "hdmi"]),
    ("NE",   "085",   32,  ["touchlink", "hdmi"]),
    ("NE",   "172",   36,  ["touchlink", "hdmi"]),
    ("NE",   "173",   40,  ["control_panel", "hdmi"]),
    ("NE",   "175",   40,  ["control_panel", "hdmi"]),
    ("NE",   "271",   52,  ["touchlink", "hdmi", "key_required"]),
    ("NE",   "273",   34,  ["control_panel", "hdmi", "key_required"]),
    # ("NE",   "278B",  36,  ["touchlink", "hdmi"]),

    # OP — Ellen Ochoa Pavilion
    ("OP",   "201",   100, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("OP",   "220",   159, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("OP",   "230",   100, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),

    # P — Physics
    ("P",    "144",   72,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("P",    "145",   50,  ["touchlink", "hdmi"]),
    ("P",    "146",   60,  ["touchlink", "hdmi"]),
    ("P",    "147",   40,  ["touchlink", "hdmi"]),
    ("P",    "148",   50,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("P",    "149",   42,  ["touchlink", "hdmi"]),
    ("P",    "244",   50,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),

    # PG — Peterson Gym
    ("PG",   "153",   220, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("PG",   "242",   125, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("PG",   "244",   45,  ["touchlink", "hdmi"]),

    # PS — Physical Sciences
    ("PS",   "130",   100, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("PS",   "140",   35,  ["control_panel", "key_required"]),

    # PSFA — Professional Studies and Fine Arts
    ("PSFA", "136",   42,  ["control_panel", "hdmi"]),
    ("PSFA", "300",   49,  ["touchlink", "hdmi"]),
    ("PSFA", "308",   49,  ["touchlink", "hdmi"]),
    ("PSFA", "310",   75,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("PSFA", "318",   49,  ["touchlink", "hdmi"]),
    ("PSFA", "325",   60,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("PSFA", "326",   48,  ["touchlink", "key_required"]),
    ("PSFA", "350",   80,  ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("PSFA", "358",   30,  ["touchlink", "key_required"]),
    ("PSFA", "374",   30,  ["touchlink", "key_required"]),
    ("PSFA", "413",   35,  ["control_panel", "key_required"]),
    ("PSFA", "437",   42,  ["control_panel", "hdmi"]),

    # SH — Storm Hall
    ("SH",   "101",   70,  ["control_panel", "hdmi", "microphone"]),
    ("SH",   "104",   40,  ["touchlink", "hdmi"]),
    ("SH",   "105",   70,  ["control_panel", "hdmi", "microphone", "key_required"]),
    ("SH",   "109",   70,  ["control_panel", "hdmi", "microphone"]),
    ("SH",   "113",   40,  ["control_panel", "hdmi"]),
    ("SH",   "119",   70,  ["control_panel", "hdmi", "microphone"]),
    ("SH",   "123",   70,  ["control_panel", "hdmi", "microphone"]),
    ("SH",   "127",   70,  ["control_panel", "hdmi", "microphone", "key_required"]),
    ("SH",   "213",   40,  ["control_panel", "hdmi"]),
    ("SH",   "216",   40,  ["control_panel", "hdmi"]),
    ("SH",   "221",   40,  ["control_panel", "hdmi"]),
    ("SH",   "316",   40,  ["control_panel", "hdmi"]),
    ("SH",   "320",   40,  ["control_panel", "hdmi"]),

    # SHW — Storm Hall West
    ("SHW",  "11",    252, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),
    ("SHW",  "12",    435, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),

    # SLHS — Speech, Language, and Hearing Sciences
    ("SLHS", "149",   35,  ["touchlink", "hdmi"]),
    ("SLHS", "220",   44,  ["touchlink", "hdmi"]),
    ("SLHS", "247",   40,  ["control_panel", "key_required"]),

    # SSE — Student Services East
    ("SSE",  "1401",  123, ["touchlink", "hdmi", "microphone", "key_required", "automated_capture"]),

    # SSW — Student Services West
    ("SSW",  "1500",  128, ["control_panel", "microphone", "key_required"]),
    ("SSW",  "2500",  30,  ["control_panel", "hdmi"]),
    ("SSW",  "2501",  49,  ["touchlink", "hdmi"]),
    ("SSW",  "2512",  30,  ["control_panel", "hdmi"]),
    ("SSW",  "2514",  30,  ["control_panel", "hdmi"]),
    ("SSW",  "2522",  30,  ["control_panel", "hdmi"]),
    ("SSW",  "2532",  51,  ["control_panel", "hdmi"]),
    ("SSW",  "2650",  42,  ["control_panel", "key_required"]),
    ("SSW",  "3620",  50,  ["control_panel", "key_required"]),
    ("SSW",  "3630",  30,  ["touchlink", "hdmi"]),
]


def seed(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cursor.fetchall()]
    print(f"Tables found: {tables}")

    if "rooms" not in tables:
        print("No 'rooms' table found — creating one...")
        cursor.execute("""
            CREATE TABLE rooms (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                building TEXT NOT NULL,
                room_num TEXT NOT NULL,
                capacity INTEGER NOT NULL,
                features TEXT NOT NULL DEFAULT '[]',
                UNIQUE(building, room_num)
            )
        """)

    # Clear existing rooms and re-seed with updated features
    cursor.execute("DELETE FROM rooms")

    rows = [
        (building, room_num, capacity, json.dumps(features))
        for building, room_num, capacity, features in ROOMS
    ]

    cursor.executemany("""
        INSERT INTO rooms (building, room_num, capacity, features)
        VALUES (?, ?, ?, ?)
    """, rows)

    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM rooms")
    total = cursor.fetchone()[0]
    conn.close()

    print(f"✅  Seeded {total} rooms into {db_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default="campus_classroom_reserve.db")
    args = parser.parse_args()
    seed(args.db)
