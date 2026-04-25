# Stone RigOps

Standalone rig operations app for tracking rigs, rig systems, maintenance, repairs, and specialized tools.

## Current scope

- Add rigs.
- Track rig status.
- Add rig systems: hydraulic, air, electrical, powertrain, controls, safety, fuel, structural, and other.
- Track system health.
- Add specialized tools: tubing tongs, rod tongs, industrial pumps, field tools, safety tools, etc.
- Track tool status.
- Add maintenance tasks against a rig, system, or tool.
- Add repair tickets against a rig, system, or tool.
- Use a pump-jack video background on the homepage and rig pages.

## Local setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open:

```text
http://localhost:3000
```

## Pump-jack video

The UI expects this file:

```text
public/videos/pump-jacks.mp4
```

To copy your existing video from another repo:

```bash
./scripts/copy-pumpjack-video.sh ~/repos/silverpines-product/public/videos/YOUR_VIDEO_NAME.mp4
```

Or from Windows into WSL2, use `/mnt/c/...`, for example:

```bash
./scripts/copy-pumpjack-video.sh "/mnt/c/Users/YOUR_WINDOWS_USER/Videos/pump-jacks.mp4"
```

## Database

This app uses SQLite locally through Prisma:

```text
prisma/dev.db
```

That keeps setup simple while the standalone Stone product is being shaped. When the app is ready for deployment, migrate the datasource to Postgres/Neon/Vercel Postgres.
