# HOMINSU Frontend: How to Use

This guide explains how to install, run, and use the HOMINSU React frontend. It
also describes each route, the development accounts, backend connectivity, and
the current demo limitations.

## 1. What the frontend contains

HOMINSU presents three product modes in one application:

| Mode | Color | Route | Intended user |
| --- | --- | --- | --- |
| Consumer | Red | `/` | Viewers browsing and purchasing VR content |
| VR Studio | Blue | `/creator` | Creators exploring and managing content |
| PRO Studio | Amber | `/pro/operator` | Venue operators managing VR headsets |

The mode bar at the top provides direct navigation among these experiences.

## 2. Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Access to the HOMINSU backend at `https://hominsu-be-production.up.railway.app`
- A current Chrome, Edge, Firefox, or Safari browser

Verify Node.js and npm:

```bash
node --version
npm --version
```

## 3. Install and configure

### Ubuntu

```bash
cd /path/to/HOMINSU-FE
npm install
cp .env.example .env.local 2>/dev/null || true
```

If `.env.example` is not present, create `.env.local` with:

```text
VITE_API_BASE_URL=https://hominsu-be-production.up.railway.app/api/v1
```

### Windows PowerShell

```powershell
Set-Location C:\path\to\HOMINSU-FE
npm install
Set-Content -Path .env.local -Value "VITE_API_BASE_URL=https://hominsu-be-production.up.railway.app/api/v1"
```

`VITE_API_BASE_URL` must include `/api/v1` and must not point to the Swagger
page. Restart Vite after changing an environment variable.

## 4. Start the application

Start the backend first. Then run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`. To expose Vite to other devices on the same local
network, use:

```bash
npm run dev -- --host 0.0.0.0
```

Recommended startup order:

1. Confirm `https://hominsu-be-production.up.railway.app/health` returns `status: ok`.
2. Create `.env.local` from `.env.example` if an explicit API override is needed.
3. Start this frontend on port `5173`.
4. Open `http://localhost:5173`.

## 5. Development accounts

| Role | Email | Password | Primary access |
| --- | --- | --- | --- |
| Member | `member@hominsu.local` | `member1234` | Profile, wallet, top-up, content unlock |
| Operator | `operator@hominsu.local` | `operator1234` | Operator device and sync APIs |
| Admin | `admin@hominsu.local` | `admin1234` | Operator APIs and administrative role |

These are local seed accounts only. Never use these passwords in production.

## 6. Sign in

1. Open `/` and select **Login**, or open `/profile` and select the login action.
2. Enter one of the development accounts.
3. Submit the form.
4. The frontend stores the returned JWT in browser `localStorage` under
   `homeinsu_token`.
5. Subsequent wallet, unlock, profile, and operator requests include the token.

Use the operator account before opening `/pro/operator`. A member token can view
the page's offline preview, but the backend rejects operator mutations with
HTTP `403`.

The current logout button is visual only. To clear a development login manually,
open browser developer tools and remove `homeinsu_token` from Local Storage, or
run this in the console:

```javascript
localStorage.removeItem('homeinsu_token')
location.reload()
```

## 7. Route guide

| Route | Description |
| --- | --- |
| `/` | Consumer home with hero, categories, live rail, and content grid |
| `/content/:id` | Content detail, preview state, and unlock choices |
| `/live` | Live and scheduled VR broadcasts |
| `/shorts` | Full-screen vertical short-form content feed |
| `/points` | Wallet balance, point packages, and top-up history area |
| `/profile` | Current account and MY menu |
| `/creator` | Blue VR Studio catalog experience |
| `/pro/operator` | Amber headset fleet operator console |

Unknown frontend routes redirect to `/`.

## 8. Consumer flow

### Browse and open content

1. Open `/`.
2. Browse the live rail or content grid.
3. Select a content card to open `/content/<id>`.
4. Review its title, creator, description, price, and preview state.

If the backend is unavailable, public display pages use local mock records and
show an offline-preview indication. Mutations never report fake success.

### Unlock content

1. Sign in as the member account.
2. Open a content detail page.
3. Select one of the implemented methods:
   - **Points** deducts the content's point price.
   - **Watch ad** creates an ad-method unlock in the current demo.
   - **Cash** deducts the content price from the seeded cash wallet.
4. After success, the page changes to the unlocked state.

The ad option does not currently run a real advertising SDK. Cash unlock does
not contact a payment gateway. These are backend transaction demonstrations.

### Use Live and Shorts

1. Open `/live` to view live and scheduled streams.
2. Open `/shorts` to scroll vertically through snap-aligned content.
3. Select **View full content** from a short to open its detail route.

## 9. Points and profile

### Check and top up points

1. Sign in as a member.
2. Open `/points`.
3. Confirm the live balance label appears instead of the offline preview label.
4. Select a point package.
5. The development backend credits the package immediately and records a unique
   payment reference generated by the browser.

This flow simulates completed payment. Add a real payment provider and webhook
verification before production use.

### Profile

Open `/profile` to see the seeded name, email, and role. Payment management,
verification management, settings, and several MY menu actions are currently UI
placeholders.

## 10. Creator mode

1. Select **VR Studio** in the mode bar or open `/creator`.
2. Browse the blue creator catalog and categories.
3. Select a project to open the shared content detail page.

The upload, project management, analytics, and studio settings controls are
currently design surfaces. Upload APIs are not yet implemented.

## 11. Operator mode

1. Sign in using `operator@hominsu.local`.
2. Select **Operator** in the mode bar or open `/pro/operator`.
3. Review online/offline counts and each device's model, battery, firmware, IP,
   location, and last-seen time.
4. Use **WAKE**, **SLEEP**, **REBOOT**, or **UPDATE** for a bulk fleet command.
5. Use the card-level restart control for one headset.
6. Select **SYNC PLAY** to create synchronization records for the displayed
   devices.

Commands are queued in PostgreSQL. Connecting these records to real headsets or
an MQTT/WebSocket delivery service is a separate deployment task.

## 12. Backend and Swagger checks

Use these URLs while diagnosing frontend calls:

| URL | Purpose |
| --- | --- |
| `https://hominsu-be-production.up.railway.app/` | Backend service information |
| `https://hominsu-be-production.up.railway.app/health` | Health check |
| `https://hominsu-be-production.up.railway.app/docs/` | Interactive Swagger API testing |
| `https://hominsu-be-production.up.railway.app/openapi.json` | Raw OpenAPI document |

Swagger can log in and test protected endpoints independently of the frontend.

## 13. Build for deployment

```bash
npm run lint
npm run build
npm run preview
```

The deployable output is written to `dist/`. Configure the web server to return
`index.html` for unknown paths so React Router routes work after page refresh.

## 14. Troubleshooting

| Symptom | Action |
| --- | --- |
| Display says offline preview | Check Railway health and verify `VITE_API_BASE_URL` |
| Login fails to connect | Check the Railway deployment and browser network errors |
| `401` response | Sign in again; the JWT may be missing or expired |
| `403` on operator action | Sign in with the operator or admin account |
| `404` API response | Ensure the URL includes `/api/v1` and uses a documented path |
| Browser reports CORS | Add the frontend origin to backend `CORS_ORIGINS` |
| Port 5173 is busy | Run `npm run dev -- --port 5174` and update backend CORS |
| Direct route refresh returns web-server 404 | Configure SPA fallback to `index.html` |
| Top-up reports duplicate reference | Retry; each request must use a unique reference |
| Build fails after dependency changes | Remove `node_modules`, run `npm install`, then rebuild |

## 15. Security notes

- Development credentials, direct top-ups, and seeded balances are not
  production payment controls.
- Serve production frontend and backend traffic over HTTPS.
- Do not expose database credentials through `VITE_*` variables; Vite embeds
  them in browser JavaScript.
- Replace localStorage JWT handling with the security model selected for the
  production environment, considering XSS and refresh-token requirements.
