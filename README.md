# Campus Classroom Reserve

Website for San Diego State University that students can use to find classrooms that are empty at the time, and book study sessions.

# Usage Notes

**Testing**

run `uv run pytest`

**Setup**

Run the following
* `uv venv` => create a virtual environment (one-time setup)
* `source .venv/bin/activate` => activate virtual environment (required each time)
* `uv sync` => sync dependencies for the virtual environment (required each time)

**Run and Open Application**

run `uv run fastapi dev src/app/main.py`

**Swagger UI**

search "http://127.0.0.1:8000/docs" on a browser

**Swagger API Endpoints and their functions**

User
* POST "/api/v1/user/signup"
  * Registers a new user
  * Returns the created user
  * Raises 409 if email address is already registered
* POST "api/v1/user/login"
  * Creates and returns a token for the user
* GET "api/v1/user/"
  * Obtains a list of all users in database
  * Can only be accessed by admin
  * Raises error 403 (forbidden) if user is not an admin
* GET "api/v1/user/me"
  * Obtains current user and makes sure they are authenticated
  * Resolves authenticated user from a Bearer token
* GET "api/v1/user/{user_id}"
  * Obtains a specific user by id
  * Raises error 403 if user is not an admin and the id entered in endpoint is not the same as their own id
* PUT "api/v1/user/{user_id}"
  * Updates information about user by id
  * Raises error 403 if user is not an admin and the id entered in endpoint is not the same as their own id
* DELETE "api/v1/user/{user_id}"
  * Deletes user from database by id
  * Raises error 403 if user is not an admin and the id entered in endpoint is not the same as their own id

Room
* GET "/api/v1/rooms/"
  * Obtains a list of all rooms in database
  * Accessible by any authenticated user
* GET "/api/v1/rooms/{room_id}"
  * Obtains a specific room by id
  * Accessible by any authenticated user
* POST "/api/v1/rooms/"
  * Creates a new room
  * Can only be done by admin
  * Raises error 403 if current user is not an admin
* PUT "/api/v1/rooms/{room_id}"
  * Replaces room data entirely, by id
  * Can only be done by admin
  * Raises error 403 if current user is not an admin
* PATCH "/api/v1/rooms/{room_id}"
  * Updates information about room partially, by id
  * Can only be done by admin
  * Raises error 403 if current user is not an admin
* DELETE "/api/v1/rooms/{room_id}"
  * Deletes room from database by id
  * Raises error 403 if current user is not an admin

Reservation
* POST "/api/v1/reservations/"
  * Creates a reservation
  * Can be done by any authenticated user
  * Ensures the user_id of reservation matches with of the current user
* GET "/api/v1/reservations/"
  * Obtains a list of reservations in database
  * If user is an admin, list all reservations in database
  * Otherwise, list each of the reservations made by the user
* GET "/api/v1/reservations/{reservation_id}"
  * Obtains a specific reservation by id
* PUT "/api/v1/reservations/{reservation_id}"
  * Updates reservation by id
* DELETE "/api/v1/reservations/{reservation_id}"
  * Deletes reservation by id
