# Personligt Dashboard - Kodedokumentation
## Oversigt

Projektet er en Next.js app (App Router) med et personligt dashboard, hvor brugeren kan:

- Se dato og tid
- Oprette og slette noter
- Oprette, afkrydse og slette to-do-opgaver
- Hente vejrdata for en by
- Skifte mellem light/dark theme
- Flytte widgets via drag-and-drop

Data for noter, to-do, theme og widget-rækkefølge gemmes lokalt i browseren via localStorage.

## Teknologistak

- Next.js 16
- React 19
- TypeScript
- SCSS (sass)

## Kør projektet lokalt

1. Installer afhængigheder:

```bash
npm install
```

2. Start udviklingsserver:

```bash
npm run dev
```

3. Åbn i browseren:

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: Starter udviklingsserver
- `npm run build`: Bygger produktion
- `npm run start`: Starter produktionsbuild
- `npm run lint`: Kører ESLint

## Projektstruktur

```text
my-app/
	src/
		app/
			layout.tsx
			page.tsx
			globals.scss
			feature-page.module.scss
			notes/page.tsx
			tasks/page.tsx
			api/weather/route.ts
		components/
			dashboard/
				DashboardClient.tsx
				DashboardClient.module.scss
				NotesPanel.tsx
				TodoPanel.tsx
```

## Routes

- `/`: Hoveddashboard med widgets
- `/notes`: Separat notes-side (samme datakilde i localStorage)
- `/tasks`: Separat to-do-side (samme datakilde i localStorage)
- `/api/weather?city=BYNAVN`: API-route der henter vejrdata via Open-Meteo

## Arkitektur og dataflow

### Layout og global opsætning

- `src/app/layout.tsx`:
	- Sætter `lang="da"`
	- Loader fonten Space Grotesk
	- Importerer globale styles
	- Definerer metadata (titel/beskrivelse)

- `src/app/globals.scss`:
	- Definerer CSS-variabler for light/dark tema
	- Bruger `data-theme` på `<html>` til tema-skift
	- Indeholder globale base styles

### Dashboard

- `src/app/page.tsx` renderer `DashboardClient`.

- `src/components/dashboard/DashboardClient.tsx` håndterer:
	- Theme state (`light`/`dark`) + persistence i localStorage
	- Clock (opdateres hvert sekund)
	- Widget-rækkefølge + drag-and-drop
	- Vejr-forespørgsler mod `/api/weather`
	- Navigation til `/notes` og `/tasks`

LocalStorage keys brugt i dashboardet:

- `dashboard-theme-v1`
- `dashboard-widget-order-v1`
- `dashboard-notes-v1`
- `dashboard-todos-v1`

### Noter

- `src/components/dashboard/NotesPanel.tsx`:
	- Opretter noter med `crypto.randomUUID()`
	- Gemmer/læser noter fra `dashboard-notes-v1`
	- Understøtter compact-tilstand (dashboard-widget)

- `src/app/notes/page.tsx`:
	- Viser fuld notes-funktion på dedikeret route

### To-do

- `src/components/dashboard/TodoPanel.tsx`:
	- Opretter opgaver med `crypto.randomUUID()`
	- Toggle af `done`
	- Gemmer/læser data fra `dashboard-todos-v1`
	- Understøtter compact-tilstand

- `src/app/tasks/page.tsx`:
	- Viser fuld to-do-funktion på dedikeret route

### Vejr-API

- `src/app/api/weather/route.ts`:
	- Validerer `city` query-param
	- Finder koordinater via Open-Meteo Geocoding API
	- Henter aktuelle vejrdata via Open-Meteo Forecast API
	- Mapper `weather_code` til dansk tekst
	- Returnerer standardiseret JSON til klienten

Eksempel på respons:

```json
{
	"city": "Copenhagen",
	"country": "Denmark",
	"temperature": 7.2,
	"windSpeed": 14.1,
	"weatherDescription": "Delvist skyet"
}
```

Fejlkoder:

- `400`: Manglende bynavn
- `404`: By ikke fundet
- `502`: Ufuldstændige data fra upstream
- `500`: Uventet serverfejl

## Styling

- `src/components/dashboard/DashboardClient.module.scss`:
	- Hero, widget-grid, formularer og lister
	- Responsive breakpoint ved `max-width: 900px`
	- Animation (`rise`) og drag-state (`dragging`)

- `src/app/feature-page.module.scss`:
	- Delt layout til `/notes` og `/tasks`

Bemærk: `src/app/page.module.scss` findes stadig i projektet, men bruges ikke af den nuværende dashboard-forside.

## Kendte designvalg

- Noter og opgaver er bevidst client-side og browser-lokale for enkelhed og hurtig brugeroplevelse.
- Der bruges `cache: "no-store"` i vejr-API-kald for at sikre friske data.
- Dashboardet håndterer hydration-forskel ved at vise placeholders, indtil klienten er klar.

## Mulige forbedringer

- Tilføj en egentlig backend/database til noter og opgaver
- Tilføj validering/sanitizing af input på flere niveauer
- Tilføj tests (unit/integration) for komponenter og API-route
- Tilføj fejlgrænser og bedre loading states
