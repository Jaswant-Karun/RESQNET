# RESQNET — AI-Powered Adaptive Disaster Response & Rescue Coordination

> **Tagline:** From disaster detection to rescue decision — in seconds.  
> **Domain:** Crisis & Emergency Response — Disaster Management.

---

## 1. Overview

**RESQNET** is an AI-assisted disaster response coordination platform designed for Emergency Operations Centers (EOCs). It models the full end-to-end tactical response pipeline:
```
Simulate Disaster 
  → Incident Created 
  → Analyze Situation 
  → Determine Risk 
  → Recommend Response 
  → Human Approval for Critical Actions 
  → n8n Automation 
  → Allocate Resources 
  → Deploy Rescue Teams / Drones 
  → Update Dashboard 
  → Monitor 
  → Simulate Escalation 
  → Recalculate Response
```

For the Hackathon MVP, RESQNET implements a high-fidelity **Severe Flood Inundation & Embankment Breach** disaster scenario.

---

## 2. Project Architecture & Folder Structure

```
RESQNET/
├── src/
│   ├── app/                    # Next.js App Router (Layouts & Pages)
│   │   ├── api/                # Next.js Route Handlers
│   │   │   ├── incident/       # GET /api/incident
│   │   │   └── resources/      # GET /api/resources
│   │   ├── globals.css         # Emergency Operations Center theme tokens
│   │   ├── layout.tsx          # Root layout with Header and Footer
│   │   └── page.tsx            # Main EOC Command Dashboard Shell
│   ├── components/
│   │   ├── dashboard/          # Tactical Dashboard Components
│   │   │   ├── AlertsFeed.tsx
│   │   │   ├── IncidentBanner.tsx
│   │   │   ├── InfrastructureStatus.tsx
│   │   │   ├── MapPlaceholder.tsx
│   │   │   ├── MetricsOverview.tsx
│   │   │   ├── ResourceFleet.tsx
│   │   │   ├── ResponsePlanReview.tsx
│   │   │   ├── TimelineFeed.tsx
│   │   │   └── ZoneMatrix.tsx
│   │   ├── layout/             # Application Shell Components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                 # Reusable UI primitives (shadcn pattern)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── data/                   # Deterministic Mock Data
│   │   ├── mock-flood-incident.ts
│   │   ├── mock-infrastructure.ts
│   │   ├── mock-plan-alerts.ts
│   │   ├── mock-resources.ts
│   │   ├── mock-zones.ts
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts            # Class name merger (clsx + twMerge)
│   └── types/                  # Strict TypeScript Domain Models
│       ├── alert.ts
│       ├── drone.ts
│       ├── incident.ts
│       ├── location.ts
│       ├── resource.ts
│       ├── response-plan.ts
│       ├── timeline.ts
│       └── index.ts
├── public/                     # Static assets
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Data & Type Models

- **[Incident](file:///c:/Users/jaswant%20karun/RESQNET/src/types/incident.ts):** Title, status, severity, coordinates, hydrological metrics (water depth, rise rate, precipitation rate, discharge), affected population estimates, commander, threats.
- **[Zone](file:///c:/Users/jaswant%20karun/RESQNET/src/types/location.ts):** Zoned emergency sectors (`Z-ALPHA` critical lowlands, `Z-BRAVO` commercial corridor, `Z-CHARLIE` uplands, `Z-DELTA` safe buffer staging), inundation depths, evacuation progress %.
- **[Resource](file:///c:/Users/jaswant%20karun/RESQNET/src/types/resource.ts):** Swiftwater rescue teams, inflatable motorized boats, high-clearance all-terrain transport, ALS ambulances.
- **[Drone](file:///c:/Users/jaswant%20karun/RESQNET/src/types/drone.ts):** Aerial UAVs (Thermal Sentinel, Heavy Payload Lifeline Drop, Medical Courier) with battery %, altitude, speed, payload description, telemetry link strength.
- **[Infrastructure](file:///c:/Users/jaswant%20karun/RESQNET/src/types/location.ts):**
  - **Hospitals:** Trauma centers, bed & ICU capacity, generator power backup status, radio channels.
  - **Shelters:** Indoor stadiums, school hubs, current occupancy vs capacity, food & water supply days.
  - **Roads:** Submerged arterial causeways, water depths, clearance vehicle types, designated detours.
- **[ResponsePlan](file:///c:/Users/jaswant%20karun/RESQNET/src/types/response-plan.ts):** Adaptive multi-stage response sequence, safety scores, human clearance authorization flag.
- **[Alert](file:///c:/Users/jaswant%20karun/RESQNET/src/types/alert.ts):** Critical warning notifications, sensor source, acknowledgment tracking, operational directives.
- **[TimelineEvent](file:///c:/Users/jaswant%20karun/RESQNET/src/types/timeline.ts):** Chronological log tracing from detection to analysis and dispatch.

---

## 4. How to Run

### Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the EOC Command Dashboard.

### API Endpoints:
- `GET http://localhost:3000/api/incident`
- `GET http://localhost:3000/api/resources`

### Production Build:
```bash
npm run build
npm run start
```

### Android Application (Capacitor)

RESQNET's Android application is a Capacitor shell around the existing Next.js
interface. It uses the deployed RESQNET server URL, so the existing web UI,
authentication, APIs, MongoDB, Gemini, Resend, and n8n integrations remain
unchanged. The Android project does not contain backend credentials.

Set `CAPACITOR_SERVER_URL` in `.env.local` to the deployed HTTPS RESQNET URL,
then run:

```bash
npm run build
npx cap sync android
npx cap open android
```

`CAPACITOR_SERVER_URL` is only the public application URL. Never place
`MONGODB_URI`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `N8N_ALERT_SHARED_SECRET`,
or any other server secret in Capacitor configuration or Android resources.

The Android package is `com.resqnet.app`, the display name is `RESQNET`, and
the generated project includes Android internet access, a dark RESQNET splash
screen, and placeholder launcher artwork suitable for replacement with
production branding.

### Docker development stack

The local Docker stack runs the existing Next.js application, MongoDB, and n8n
on one private Docker network. MongoDB is for local development only; use
MongoDB Atlas for production deployments.

Copy `.env.example` to `.env` and set the external API values you want to use.
For local Compose, the default database URI is:

```env
MONGODB_URI=mongodb://mongodb:27017/resqnet
```

Start the stack:

```bash
docker compose up --build
```

Services:

- RESQNET: http://localhost:3000
- MongoDB: localhost:27017
- n8n: http://localhost:5678

The containers communicate through the `resqnet-network` Docker network. n8n
callbacks use `http://resqnet:3000`, and RESQNET uses
`http://mongodb:27017` and `http://n8n:5678` internally.

Stop the stack:

```bash
docker compose down
```

View logs:

```bash
docker compose logs
docker compose logs -f resqnet
```

Named volumes preserve local MongoDB and n8n data across container restarts.
The Docker image uses Next.js standalone output and does not include
environment secrets in the image.
