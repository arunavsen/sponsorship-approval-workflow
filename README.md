# Sponsorship Approval Workflow

Full-stack technical assessment implementation for a simplified sponsorship request workflow.

## Stack

- Backend: ASP.NET Core Web API targeting .NET 8
- Frontend: React, TypeScript, Vite
- Database: PostgreSQL with EF Core
- Auth: JWT with seeded local accounts
- Deployment target: Vercel frontend, Render API, Neon PostgreSQL

## Test Accounts

All seeded users use the password `Password123!`.

| Role | Username |
| --- | --- |
| Requestor | `requestor@techzu.test` |
| Manager | `manager@techzu.test` |
| Finance Admin | `finance@techzu.test` |
| System Admin | `admin@techzu.test` |

## Local Setup

Prerequisites:

- .NET 8 SDK or newer
- Node.js 20.12 or newer
- Docker Desktop, if using the included PostgreSQL container

Run the database:

```powershell
docker compose up postgres
```

Run the API:

```powershell
dotnet restore SponsorshipApproval.sln
dotnet run --project SponsorshipApproval.Api
```

The API defaults to:

- Local HTTP: `http://localhost:5169`
- Local HTTPS (launch settings): `https://localhost:7235`
- Swagger when running locally: `http://localhost:5169/swagger`
- Docker / container HTTP: `http://localhost:8080/swagger`

Run the frontend:

```powershell
cd sponsorship-approval-ui
npm install
npm run dev
```

The frontend defaults to `http://localhost:5169` for the API when no `VITE_API_BASE_URL` is set.

Create `sponsorship-approval-ui/.env` only when pointing the UI at a deployed, HTTPS, or Docker API:

```text
VITE_API_BASE_URL=http://localhost:8080
```

## Workflow

Request statuses:

- Draft
- Pending Manager Approval
- Pending Finance Review
- Approved
- Rejected
- Cancelled

Rules enforced by the API:

- Requestors create drafts, submit drafts, view their own requests, and cancel requests before finalization.
- Managers can only approve or reject requests in `PendingManagerApproval`.
- Finance admins can only approve or reject requests in `PendingFinanceReview`.
- System admins can view all requests, view workflow history, and manage sponsorship types.
- Every create, update, submit, approve, reject, and cancel operation writes a workflow history record.

## Architecture

The backend uses a small layered structure:

- `Domain`: workflow entities and enums.
- `Data`: EF Core `AppDbContext` and seed data.
- `Services`: JWT auth, current-user access, password hashing, DTO mapping, and workflow transition rules.
- `Controllers`: role-scoped API endpoints for requestors, managers, finance admins, and system admins.

The frontend is a role-aware console:

- Login screen with the seeded accounts.
- Requestor workspace for draft creation, submission, cancellation, and own-request tracking.
- Manager queue for first-stage approval.
- Finance queue for final review.
- Admin workspace for all requests, history, and sponsorship type management.

## Deployment Notes

Neon PostgreSQL:

1. Create a PostgreSQL database.
2. Copy the connection string.
3. Set it on Render as `ConnectionStrings__DefaultConnection`.

Render API:

1. Connect the repository.
2. Use the included `render.yaml` or create a Docker web service.
3. Set `Cors__AllowedOrigins__0` to the deployed Vercel URL.
4. Keep `Jwt__SigningKey` as a generated secret.

Vercel frontend:

1. Set project root to `sponsorship-approval-ui`.
2. Set `VITE_API_BASE_URL` to the Render API URL.
3. Deploy and use the Vercel URL as the frontend testing URL.

## Useful Commands

```powershell
dotnet test SponsorshipApproval.sln
cd sponsorship-approval-ui
npm run build
```

## Assessment Links To Provide

- Frontend testing URL: add after Vercel deployment
- Backend API URL: add after Render deployment
- Swagger URL: `{Backend API URL}/swagger`
- Git repository link: [https://github.com/arunavsen/sponsorship-approval-workflow.git](https://github.com/arunavsen/sponsorship-approval-workflow.git)

## Tradeoffs

- Supporting document upload is represented as optional document name and URL fields rather than binary file storage. This keeps the core workflow, RBAC, and audit logic clear within the assessment timeframe.
- The seed routine creates tables automatically when no EF migrations exist, which makes reviewer setup faster. A production version should add generated migrations and run them through CI/CD.
- Authentication is intentionally simple JWT username/password auth with seeded users. External identity providers and email notifications are out of scope for this assessment.
