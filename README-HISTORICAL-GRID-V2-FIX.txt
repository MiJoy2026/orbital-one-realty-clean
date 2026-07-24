Orbital One Realty — Historical Grid V2 Snapshot Classification Fix

Purpose
-------
Preserves paid orders from earlier Grid V2 geography releases without trying to
reconstruct them against the current active parcel grid.

Changes
-------
1. Historical prior-geography orders are excluded from current missing-image counts.
2. Automatic backfill processes only currently selectable Grid V2 properties.
3. Admin order detail labels unsupported old Grid V2 orders as historical and removes
   the impossible Create Property Snapshot action.
4. The property-images dashboard shows a separate Historical Prior-Geography count.
5. Existing orders, certificates, ownership records, and sold status are unchanged.

Installation
------------
Extract this ZIP into the project root with overwrite enabled.

Then run:
  npm run build
  npm run dev

Expected local verification
---------------------------
/admin/property-images should show:
  Paid Orders: 1
  Images Ready: 0
  Current Images Missing: 0
  Historical Prior-Geography: 1

The Rumker order detail should show:
  Historical Grid V2 order
  Prior-geography property preserved

It should no longer show Create Property Snapshot for that order.

Next functional test
--------------------
Complete one Stripe test purchase using a currently selectable active-grid property.
The new order should automatically create a LunaScape snapshot. Verify the image on:
  /success
  /account
  /admin/orders/<new-order-id>
  /admin/property-images

Do not commit or push until the current-grid purchase and image download succeed.
