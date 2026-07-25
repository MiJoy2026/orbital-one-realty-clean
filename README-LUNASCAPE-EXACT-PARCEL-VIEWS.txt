Orbital One / LunaScape Exact Parcel Terrain Views

This package upgrades the primary LunaScape property image so it uses the real lunar terrain directly beneath the purchased parcel, cropped tightly around the final owned square. The exact parcel is clearly outlined while still showing immediate surrounding terrain for context.

Included changes:
- lib/lroc-terrain-renderer.ts
- lib/property-image-renderer.ts
- components/LunaScapeImageGallery.tsx
- app/api/property-image/[snapshotId]/route.ts
- lib/send-order-email.ts

No database migration is required.
No npm install is required.
