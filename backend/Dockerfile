# NOTE: This is largely copied from the professor backend and slightly tweaked for our needs.
# Use an official slim Python runtime image that satisfies this project's Python requirement.
FROM python:3.14-slim

# Disable .pyc generation to keep the container filesystem cleaner.
ENV PYTHONDONTWRITEBYTECODE=1
# Stream Python logs directly to stdout/stderr for container-friendly logging.
ENV PYTHONUNBUFFERED=1
# Avoid keeping pip's package cache to reduce image size.
ENV PIP_NO_CACHE_DIR=1
# Add the source directory to PYTHONPATH so `app.main` resolves correctly.
ENV PYTHONPATH=/app/src

# Set the working directory inside the container for all following commands.
WORKDIR /app

# Install minimal system build tools needed by some Python dependencies with native extensions.
RUN apt-get update \
    && apt-get install --no-install-recommends -y build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only the dependency manifest first to maximize Docker layer cache reuse.
COPY pyproject.toml /app/pyproject.toml


# Parse `project.dependencies` from pyproject.toml and install them with pip.
RUN python -c "import tomllib, subprocess; \
deps=tomllib.load(open('/app/pyproject.toml','rb')).get('project',{}).get('dependencies',[]); \
subprocess.check_call(['pip','install',*deps])"

# Copy the FastAPI application source code into the image.
COPY src /app/src

# Copy the example environment into the app so that it uses the postgres database rather than a local connection.
# NOTE: For an "official deployment" this would need to be changed for security.
COPY .env.example /app/.env

# Create a dedicated non-root user for better runtime security.
RUN useradd --create-home --shell /usr/sbin/nologin appuser
# RUN chown -R appuser:appuser /app/
# RUN chmod -R 777 /app/

# Run the container process as the non-root application user.
USER appuser
# Document the port used by the FastAPI/Uvicorn server.
EXPOSE 8000

# Start the API server so frontends can call it via HTTP on port 8000.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--env-file", ".env"]
