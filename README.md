# Electronics Store — agent working copy

This folder is an independent working copy of the electronics store project, prepared for continued development with coding agents. The original project remains in the parent folder.

## Structure

- `backend/`: NestJS API
- `frontend/`: Next.js web application
- `docker-compose.yaml` and related files: local service configuration
- `*.dbml` and `*.sql`: database schema and reference files

## Getting started

Install dependencies separately in the root, backend, and frontend folders, then run the services from the root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
npm run dev
```

Configure local environment variables using the settings expected by each service. Keep `.env` files out of Git; add safe examples such as `.env.example` if the required variable names need documentation.

The root `npm run dev` starts the backend and frontend concurrently. See `AGENTS.md` for guidance when working with an agent.

## Run the full stack with Docker

Install and start Docker Desktop, then run this command from the repository root:

```bash
docker compose up --build
```

Open the frontend at `http://localhost:3000` and the API Swagger page at `http://localhost:3001/api/docs`. The stack starts MySQL, Redis, the NestJS API, and the Next.js app. On first startup, MySQL imports `electronics_store_dev.sql` into the local `fixpro` database. MySQL data persists in the `mysql_data` volume; the SQL import runs only when that volume is first created. The Compose credentials and JWT secrets are for local development only.

Stop the stack with `Ctrl+C`, or run `docker compose down` in another terminal. `docker compose down -v` also deletes the local database volume and all data stored in it.
