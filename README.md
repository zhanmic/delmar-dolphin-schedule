# Delmar Dolfins Schedule

A modern weekly practice schedule for [Delmar Dolfins](https://www.delmardolfins.com/schedule), built on Commit Swimming’s public website API.

## Features

- Live data from `utility.commitswimming.com`
- Week view (Sunday–Saturday, America/New York)
- Filter by group: **Sr**, **Jr**, **Jr Prep**, **DEVO**, **Sr/Jr**, Other
- Recurring practices expanded with cancel/override support
- Optional meets & team events toggle

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /website-data-2a?superTeamId=g8g7f3rkF8N23vXs4` | Team name & timezone |
| `GET /website-data-2b?superTeamId=g8g7f3rkF8N23vXs4&includeMeets=false` | Practices & events |

Practices are recurring series in `events` (`label: "practice"`). This app expands them client-side.
