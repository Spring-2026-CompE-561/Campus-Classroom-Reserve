export default function AboutPage() {
	return (
		<main className="min-h-screen bg-background text-foreground p-8">
			<div className="max-w-[1100px] mx-auto space-y-4">
				{/* Featured intro card */}
				<div className="border border-border bg-card rounded-[16px] text-card-foreground p-6">
					<p className="text-sm font-semibold text-[#C41230] mb-2">
						About
					</p>
					<h2 className="text-3xl font-bold mb-4">
						SDSU Classroom Booking
					</h2>
					<hr className="border-border mb-4" />
					<p className="text-foreground mb-4">
						<i>Campus Classroom Reserve</i> is a platform that allows SDSU students,
						faculty, and campus groups to reserve classrooms and shared spaces across campus.
					</p>
					<p className="text-foreground">
						While SDSU has an existing website for booking study rooms in the library,
						this platform extends that functionality across campus.
					</p>
				</div>

				{/* Smaller cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="border border-border bg-card rounded-[16px] text-card-foreground p-6">
					<h2 className="text-2xl font-bold mb-4">Why this exists</h2>
					<hr className="border-border mb-4" />

					<div>
						<p className="text-foreground mb-4">
							Students frequently need spaces for:
							However, finding and reserving available classrooms can be difficult, requiring manual requests or unclear procedures.
						</p>
						<ul className="list-disc marker:text-[#C41230] ml-6 mb-4">
							<li>Group study sessions</li>
							<li>Project collaboration</li>
							<li>Practice presentations</li>
						</ul>
						<p className="text-foreground mb-4">
							However, finding and reserving available classrooms can be difficult, requiring manual requests or unclear procedures.
						</p>
						<p className="text-foreground">
							<b>Campus Classroom Reserve</b> brings this all into one place!
						</p>
					</div>
				</div>

				<div className="border border-border bg-card rounded-[16px] text-card-foreground p-6">
					<h2 className="text-2xl font-bold mb-4">What you can do</h2>
					<hr className="border-border mb-4" />
					<div>
						<p className="text-foreground mb-4">
							With Campus Classroom Reserve, you can:
						</p>
						<ul className="list-disc marker:text-[#C41230] ml-6">
							<li>Browse available classrooms across campus</li>
							<li>View room details (capacity, location, features)</li>
							<li>Reserve spaces for specific times</li>
							<li>Manage and track your bookings</li>
						</ul>
					</div>
				</div>

				<div className="border border-border bg-card rounded-[16px] text-card-foreground p-6">
					<h2 className="text-2xl font-bold mb-4">Who it's for</h2>
					<hr className="border-border mb-4" />
					<div>
						<p className="text-foreground mb-4">
							This platform is designed for:
						</p>
						<ul className="list-disc marker:text-[#C41230] ml-6">
							<li>Students</li>
							<li>Student organizations</li>
							<li>Faculty and staff</li>
						</ul>
					</div>
				</div>

				<div className="border border-border bg-card rounded-[16px] text-card-foreground p-6">
					<h2 className="text-2xl font-bold mb-4">Our goal</h2>
					<hr className="border-border mb-4" />
					<div>
						<p className="text-foreground">
							Our goal is to make campus spaces more accessible and help the community make more consistent use of shared resources.
						</p>
					</div>
				</div>
				</div>
			</div>
		</main>
	);
}
