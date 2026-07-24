ORBITAL ONE REALTY
LUNASCAPE SCENIC PROPERTY VIEWS

MILESTONE PURPOSE
-----------------
This upgrade keeps the existing exact parcel-locator image and adds a new
primary customer-facing scenic image made from real LROC lunar terrain.

The scenic image:
- centers the real LROC terrain on the recorded Grid V2 parcel;
- outlines only the owned property, not the entire parcel grid;
- identifies nearby lunar attractions when present in the scene;
- includes the nearest known feature, approximate distance, and direction;
- includes the property ID, location, certificate, and 2026 collection branding;
- is intended to be attractive and shareable while remaining honest about
  being an orbital terrain portrait rather than a ground-level photograph.

The existing image remains available as "Parcel Locator" for exact map context.

FILES IN THIS UPGRADE
---------------------
app/api/property-image/[snapshotId]/route.ts
app/account/page.tsx
app/success/page.tsx
app/admin/orders/[orderId]/page.tsx
app/admin/property-images/page.tsx
components/LunaScapeImageGallery.tsx
lib/lroc-terrain-renderer.ts
lib/property-image-renderer.ts
lib/send-order-email.ts

DATABASE CHANGES
----------------
None. This uses the permanent OwnedPropertySnapshot data already installed.
No Prisma migration is required.

IMAGE URLS
----------
Scenic view (default):
/api/property-image/SNAPSHOT_ID?view=scenic

Parcel locator:
/api/property-image/SNAPSHOT_ID?view=locator

Thumbnail:
&size=thumb

Download:
&download=1

LOCAL TEST CHECKLIST
--------------------
1. Run npm run build.
2. Start npm run dev.
3. Use a paid property from the ACTIVE Grid V2 geography.
4. Open the order in /admin/orders.
5. Confirm both images appear:
   - Scenic Property View
   - Parcel Locator
6. Download both PNG files and open them.
7. Confirm the scenic view shows real lunar terrain without the full parcel grid.
8. Confirm the gold boundary is centered on the correct property.
9. Confirm the account page shows both images.
10. Confirm a new Stripe test purchase shows both images on /success.
11. Confirm the order email contains separate scenic-view and locator links.
12. Do not checkpoint until all tests pass.

HISTORICAL GRID V2 ORDERS
-------------------------
Prior-geography Grid V2 orders remain preserved and continue to be excluded
from current image generation when their original geometry is not selectable.
