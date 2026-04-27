import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";

/*
  Temporary data for development.
  This represents the current user's reservations.

  Replace this with data from the backend once it's ready:
  GET /reservations?user_id=...

  TODO:
  - Fetch real data from API
  - Handle loading and error states
  - Remove this mock data after integration
*/
const mockReservations = [
  {
    id: 1,
    room: "Storm Hall 101",
    date: "April 28, 2026",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    purpose: "Study Group",
  },
  {
    id: 2,
    room: "Love Library 204",
    date: "April 29, 2026",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    purpose: "Project Meeting",
  },
  {
    id: 3,
    room: "GMCS 314",
    date: "April 30, 2026",
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    purpose: "Exam Prep",
  },
];

export default function HomePage() {
  return (
    <main className="bg-gray-100 pt-6 px-8 pb-6 min-h-screen">

      {/* List of the user's reservations */}
      <div className="flex flex-col gap-4">
        {mockReservations.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5 flex items-center"
          >
            {/* Room name and purpose */}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-800">
                {res.room}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {res.purpose}
              </p>
            </div>

            {/* Date and time */}
            <div className="flex flex-col gap-1 w-64 items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="w-4 h-4 text-[#C41230]" />
                {res.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-[#C41230]" />
                {res.startTime} – {res.endTime}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-1 justify-end">
              {/*
                TODO:
                - Connect Edit button to edit flow
                - Connect Cancel button to DELETE /reservations/:id
                - Add confirmation before canceling
              */}
              <button className="text-sm border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition">
                Edit
              </button>
              <button className="text-sm border border-[#C41230] text-[#C41230] px-4 py-1.5 rounded-lg hover:bg-red-50 transition">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/*
        TODO:
        - Add page title (e.g. "My Reservations")
        - Add "Create Reservation" button
        - Add user/account section
        - Handle empty state (no reservations)
      */}

    </main>
  );
}