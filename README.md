# Haven Group — Hospitality Management Starter

A working React + TypeScript frontend with a simulated Express API for a multi-property hotel group and marketing business.

> **Demo only.** The mock login does not authenticate users. The API has no real authorization, production security, or accounting guarantees. Use fake data only.

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- npm

## Run locally
```bash
npm install
npm run dev
```
Then open:
- Frontend: http://localhost:5173
- Simulated API health: http://localhost:4000/api/v1/health

The API initializes `server/data.json` from sample data on first run. It writes changes back to that local JSON file so reservation, room status, employee, and expense changes survive server restarts. Delete `server/data.json` to reset the sample data (stop the server first).

## Working modules
- Owner dashboard with sample revenue, occupancy, property comparison, tasks, and recent activity
- Reservations: search, list, and create bookings
- Rooms: search and change room status
- HR: search employee directory and add employees
- Finance: search and record expenses
- Maintenance task list
- Marketing client and campaign overview
- Reports and settings page foundations

## API routes implemented
- `GET /api/v1/health`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/login` (demo response only; not real authentication)
- `GET /api/v1/properties`
- `GET /api/v1/dashboard/overview?property_id=all|hotel-a|hotel-b`
- `GET, POST /api/v1/reservations`
- `PATCH /api/v1/reservations/:id`
- `GET /api/v1/rooms`
- `PATCH /api/v1/rooms/:id/status`
- `GET, POST /api/v1/employees`
- `GET, POST /api/v1/finance/expenses`
- `GET /api/v1/housekeeping/tasks`
- `GET /api/v1/marketing/clients`
- `GET /api/v1/marketing/campaigns`
- `GET /api/v1/audit-logs`

The rest of the endpoint catalog is planned, not implemented yet. Unknown `/api` routes return a simulated 404.

## How to connect a real backend later
- Keep the UI calling the functions in `src/api.ts`.
- Replace the URL and response handling in `src/api.ts` with your real API base URL.
- Match the response shapes used by the components, or adapt the API client there.
- Add real authentication, server-side role/property permissions, validation, rate limits, audit logs, secure uploads, and a real database before production.
- Remove demo data and the mock login.
- Use environment variables for API URLs and secrets. Never put server secrets in Vite `VITE_*` variables.

## Suggested next development steps
1. Implement authentication and role-based access on the server.
2. Add room availability and reservation overlap validation in a database transaction.
3. Implement payment ledger, folios, approvals, and accounting rules.
4. Build housekeeping, leave/attendance, payroll, inventory, and supplier workflows.
5. Add tests and an OpenAPI specification.
