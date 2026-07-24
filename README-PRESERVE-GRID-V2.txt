ORBITAL ONE REALTY — LEGACY-ONLY ORDER CLEANUP

Purpose
-------
Deletes legacy trial orders while preserving all orders whose property IDs match the current LunaSphere Grid V2 formats:

- STATE-R-C###-R###
- STATE-CITY-##-CB-C###-R###
- STATE-TOWN-##-TB-C###-R###

The script also preserves:
- Grid V2 owned-property snapshots
- Grid V2 property status
- Grid V2 reservations
- Users
- HOA member records
- LunaSphere geography and releases
- Grid V2 inventory

Before deletion it writes a JSON backup to the project's backups folder.

Install
-------
Extract this ZIP into the orbital-one-realty-clean project root and allow it to overwrite:

scripts/reset-legacy-orders.mjs

Dry run
-------
node --env-file=.env --env-file=.env.local scripts/reset-legacy-orders.mjs

Execute only after reviewing the dry run
-----------------------------------------
node --env-file=.env --env-file=.env.local scripts/reset-legacy-orders.mjs --execute --confirm=DELETE-LEGACY-ORDERS-ONLY
