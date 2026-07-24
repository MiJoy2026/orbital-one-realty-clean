ORBITAL ONE REALTY — CONTROLLED LEGACY-ORDER RESET

Purpose
-------
This utility removes all existing legacy trial orders so the LunaScape/Grid V2
purchase and property-image workflow can be tested from a clean sales state.

It preserves:
- LunaSphere geography and releases
- Grid V2 inventory definitions
- User accounts
- HOA member records
- Admin access
- Stripe configuration

It resets/removes:
- Legacy Order rows
- OwnedPropertySnapshot rows attached to those orders
- AcreageAllocation rows attached to those orders
- Matching completed/reserved PropertyReservation rows
- Sold status on properties referenced by those orders
- StateInventory soldAcres totals

Safety controls
---------------
1. The first run is always a dry run.
2. The script refuses to proceed if any order has a Grid V2-shaped property ID.
3. The execute command requires an exact confirmation phrase.
4. Before deletion, the script writes a JSON backup into the project's backups folder.
5. The database changes occur inside one transaction.

Installation
------------
Extract this ZIP into:
C:\Users\MiJoy Laptop\Downloads\orbital-one-realty-clean

After extraction, this file should exist:
scripts\reset-legacy-orders.mjs

Step 1 — stop the local server
------------------------------
Press Ctrl+C in the Command Prompt running npm run dev.

Step 2 — dry run
----------------
From the project root, run:

node --env-file=.env --env-file=.env.local scripts\reset-legacy-orders.mjs

The dry run changes nothing. It should report:
Grid V2-shaped orders found: 0

Do not execute the reset if it reports any Grid V2-shaped order.

Step 3 — execute after reviewing the dry run
--------------------------------------------
Run:

node --env-file=.env --env-file=.env.local scripts\reset-legacy-orders.mjs --execute --confirm=DELETE-ALL-LEGACY-ORDERS

The script will print the backup file path and deletion totals.
Expected final checks:
Orders remaining: 0
Snapshots remaining: 0

Step 4 — restart and verify
---------------------------
Run:

npm run dev

Then verify:
http://localhost:3000/admin/orders
http://localhost:3000/admin/property-images

The order list should be empty and the property-image counters should be zero.

Next test
---------
Complete one controlled Grid V2 Stripe test-mode purchase. Confirm fulfillment,
property status, LunaScape snapshot generation, image download, customer account,
and admin order details before creating a Git checkpoint.
