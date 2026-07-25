ORBITAL ONE EXPLORE PAGE LAUNCH REDESIGN

Updates:
- Replaces the database-inventory-first Explore page with a premium LunaSphere discovery experience.
- Adds Moon Atlas, states, cities, towns, rural property, attractions, LunaScape, current releases, and planned member-experience sections.
- Uses existing Orbital One imagery and existing routes; no duplicate map, cart, pricing, or property system is added.
- Removes AP-R-TEST-001 from the Explore presentation because the raw inventory list is no longer the landing-page experience.
- Includes an idempotent one-time database cleanup script for AP-R-TEST-001.

Updated file:
- app/explore/page.tsx

One-time cleanup script:
- scripts/delete-launch-test-property.mjs

Run the cleanup from the project root after installing:
node --env-file=.env.local scripts/delete-launch-test-property.mjs

No Prisma migration and no npm install are required.
