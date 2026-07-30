# CBM ALS

CBM ALS is a shipment planning and CBM calculator app for browsing product records, building a shipment, and exporting shipment summaries. It combines a React/Vite frontend with a small Express backend that loads product data from SQL Server.

## What it does

- Calculates CBM from dimensions or uses a preset CBM value when one is available.
- Lets users search a product directory and add products to the active shipment.
- Supports editing, duplicating, removing, and clearing shipment items.
- Tracks shipment totals, gross weight, volumetric weight for air freight, and container utilization.
- Persists the current shipment in `localStorage` under `cbm-shipment`.
- Exports shipment summaries to Excel and PDF.
- Lets users add or edit directory items manually through the app UI.

## Tech Stack

- React 19
- Vite
- Framer Motion
- Express
- SQL Server via `mssql`
- Excel/PDF export via `xlsx`, `jspdf`, and `jspdf-autotable`

## Prerequisites

- Node.js `20.12.0` or newer
- Access to the SQL Server database used by the backend

## Getting Started

Install dependencies:

```bash
npm install
```

Run the frontend only:

```bash
npm run dev
```

Run the backend only:

```bash
npm start
```

Run both together during development:

```bash
npm run dev:full
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint the codebase:

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the project root for the backend. The app supports either a plain database password or an encrypted password plus passphrase.

Required backend variables:

- `FRONTEND_ORIGIN` - comma-separated list of allowed frontend origins for CORS
- `DB_SERVER` - SQL Server host name
- `DB_DATABASE` - database name
- `DB_USERNAME` - database user name
- `DB_PASSWORD` - plain database password, used when encrypted credentials are not configured

Optional backend variables:

- `PORT` - backend port, defaults to `3001`
- `DB_PORT` - SQL Server port, defaults to `1433`
- `DB_PASSWORD_ENCRYPTED` - encrypted database password payload
- `DB_PASSWORD_PASSPHRASE` - passphrase used to decrypt `DB_PASSWORD_ENCRYPTED`
- `DB_CA_CERT_PATH` - path to a PEM-encoded issuing CA certificate for SQL Server TLS
- `DB_TRUST_SERVER_CERTIFICATE` - set to `true` or `false` to control SQL Server certificate trust fallback

Frontend-only local development variable:

- `VITE_API_URL` - optional API base URL for local frontend development when the backend is not served from the same origin

Example `.env`:

```env
FRONTEND_ORIGIN=http://localhost:5173
DB_SERVER=your-sql-server
DB_DATABASE=your-database
DB_USERNAME=your-user
DB_PASSWORD=your-password
PORT=3001
```

## Backend API

- `GET /api/products` - returns product records from SQL Server in the shape used by the frontend

The backend maps the database columns `Material`, `L`, `W`, `H`, `PackSize`, `1packQty`, `Net_wet`, and `Gross_wet` into the product model used by the app.

## Project Structure

- `src/components` - UI components for the calculator, shipment list, directory, modals, and layout
- `src/hooks/useShipment.js` - shipment state, product directory state, and all core business logic
- `src/utils` - CBM calculations, parsing, deduplication, and export helpers
- `backend/server.cjs` - Express API that serves product data from SQL Server

## Notes

- Product data is loaded from the backend at runtime.
- Shipment state is persisted locally in the browser, not in the database.
- Manually added products are session-only unless they are saved through the directory workflow.