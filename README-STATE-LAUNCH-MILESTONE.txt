ORBITAL ONE REALTY
STATE DIRECTORY + STATE DETAIL LAUNCH MILESTONE

WHAT THIS PACKAGE DOES

1. Redesigns /states as a premium LunaSphere state directory.
2. Redesigns /states/[stateName] as a complete state destination page.
3. Shows all three cities and all twenty towns with their existing official descriptions.
4. Adds state landmarks, property paths, live activity, Atlas links, and Quick Pick links.
5. Adds responsive Next.js image sizing.
6. Corrects city/town routing so a locality is always associated with its state.
7. Corrects city/town property queries so same-named localities in different states never merge inventory.
8. Adds a choice screen when an old state-less city or town URL is ambiguous.
9. Updates Atlas search, property breadcrumbs, and map popups to use state-aware links.

ROUTING AUDIT FINDING

The official LunaSphere directory contains:
- 18 city names used in more than one state.
- 69 town names used in more than one state.

The earlier routes used only the city or town name. That could open the wrong location and could combine property records from different states. This package keeps the existing URL routes for compatibility, adds the state as a required location qualifier to all current internal links, and safely disambiguates old links.

IMPORTANT

The City and Town pages receive the routing and inventory-correctness foundation in this package. Their full visual launch redesigns remain the next two controlled milestones.

NO DATABASE MIGRATION IS REQUIRED.
NO NPM INSTALL IS REQUIRED.

INSTALL

1. Stop npm run dev with Ctrl+C.
2. Expand this ZIP into the project root with overwrite enabled.
3. Delete .next.
4. Run npm run build.
5. Run npm run dev.

TEST

- Open /states on desktop and mobile.
- Open several state detail pages.
- Confirm each state shows 3 cities and all 20 towns.
- Test a state with attractions, such as Tycho, Copernicus, or Tranquillitatis.
- Open city and town links from a state page.
- Confirm the URL includes ?state=STATE_NAME.
- Test a duplicate city name such as Highland City in both Hammel and Rupes Altai.
- Test a duplicate town name such as Gateway Ridge in both Hammel and Grimaldi.
- Remove the ?state= value from a duplicate locality URL and confirm the choice screen appears.
- Test a city/town link from a property page.
- Test city/town links from Moon Atlas popups.
- Search for a duplicate locality through Atlas search and confirm state choices appear.
- Confirm property records never appear under the same-named locality in another state.
