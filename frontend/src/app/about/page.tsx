export default function About() {
	return (
		<main>
			<style>
			{`	
				/* skipped h1, since h1 alters the navbar header title */
				h2 {
					font-size: 48px;
					font-weight: bold;
					text-align: center;
					margin-top: 20px;
					margin-bottom: 20px;
				}

				h3 {
					font-size: 32px;
					font-weight: bold;
					text-align: left;
					margin-top: 20px;
					margin-bottom: 20px;
				}

				p {
					text-align: left;
					font-size: 20px;
					margin-bottom: 20px;
				}

				ul {
					font-size: 20px;
					list-style-type: disc;
					margin-left: 30px;
					margin-bottom: 20px;
				}

				.page-width {
					max-width: 615px;
					margin: 0 auto;
				}
			`}
			</style>
			
			<h2>About Campus Classroom Reserve</h2>
			<div className = "page-width">
				<p>
					Campus Classroom Reserve is a platform that allows SDSU students, faculty, and campus groups
					to reserve classrooms and shared spaces across campus at a time the space is empty.
				</p>
				<p>
					While SDSU has an already existing website for booking study rooms in the library, this platform
					is created to extend this functionality across campus, to utilize campus spaces more consistently.
				</p>
			</div>

			<hr />

			<div className = "page-width">
				<h3>Why this exists</h3>
				
				<p>
					Students frequently need spaces for:
				</p>

				<ul>
					<li>Group study sessions</li>
					<li>Project collaboration</li>
					<li>Practice presentations</li>
				</ul>

				<p>
					However, finding and reserving available classrooms can be difficult, requiring manual requests or
					unclear procedures.
				</p>
				<p>
					<b>Campus Classroom Reserve</b> brings this all into one place!
				</p>
			</div>

			<hr />

			<div className = "page-width">
				<h3>What you can do</h3>
				
				<p>
					With Campus Classroom Reserve, you can:
				</p>

				<ul>
					<li>Browse available classrooms across campus</li>
					<li>View room details (capacity, location, features)</li>
					<li>Reserve spaces for specific times</li>
					<li>Manage and track your bookings</li>
				</ul>
			</div>

			<hr />

			<div className = "page-width">
				<h3>Who it's for</h3>

				<p>
					This platform is designed for:
				</p>

				<ul>
					<li>Students</li>
					<li>Student organizations</li>
					<li>Faculty and staff</li>
				</ul>
			</div>

			<hr />

			<div className = "page-width">
				<h3>Our goal</h3>

				<p>
					Our goal is to make campus spaces more accessible and help the community
					make more consistent use of shared resources.
				</p>
			</div>
		</main>
	);
}
