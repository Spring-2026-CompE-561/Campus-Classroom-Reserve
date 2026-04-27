import { MapPin, Phone, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] px-8 py-8 text-white">
      <div className="flex items-start gap-48">

        {/* Left */}
        <div>
          <h3 className="text-base font-semibold tracking-wide">
            SDSU Classroom Reserve
          </h3>
          <p className="text-sm font-medium text-gray-400 mt-3 leading-relaxed">
            Supporting academic success through connected campus spaces.
          </p>
        </div>

        {/* Center */}
        <div>
          <h3 className="text-base font-semibold tracking-wide">
            About
          </h3>
          <p className="text-sm font-medium text-gray-400 mt-3 leading-relaxed">
            Reserve classrooms quickly and efficiently across SDSU.
          </p>
        </div>

        {/* Right */}
        <div>
          <h3 className="text-base font-semibold tracking-wide">
            Contact
          </h3>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <MapPin size={16} />
              <span>San Diego, CA</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <Phone size={16} />
              <span>(619) 594-5200</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <Globe size={16} />
              <span className="hover:text-white transition cursor-pointer">
                sdsu.edu
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} San Diego State University
      </div>
    </footer>
  );
}
