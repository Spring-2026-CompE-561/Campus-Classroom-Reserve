import Image from "next/image";
import SignUpCard from "@/components/SignUpCard";

export default function SignUpPage() {
  return (
    <main className="bg-gray-100 pt-6 px-8 pb-6">
      {/* Background image container */}
      <div
        className="relative rounded-xl overflow-hidden w-full"
        style={{ height: "700px" }}
      >
        <Image
          src="/hepner_hall.png"
          alt="Hepner Hall SDSU"
          fill
          className="object-cover"
          quality={100}
          priority
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Left side text */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/70 rounded-xl p-6 max-w-sm z-10">
          <h2 className="text-white text-3xl font-bold leading-tight">
            Create Your Account.<br />Start Reserving.
          </h2>

          <div className="w-12 h-1 bg-[#C41230] my-3 rounded" />

          <p className="text-gray-300 text-sm">
            Join SDSU Classroom Reserve and gain access to classrooms across campus.
          </p>
        </div>

        {/* Centered sign-up form */}
        <div className="absolute inset-0 flex items-center justify-center z-10 translate-x-24">
          <SignUpCard />
        </div>
      </div>
    </main>
  );
}