Orbital One / LunaScape Two-Image Experience

This package updates the customer-facing LunaScape collection from 3 images to 2 images:

1. Your Place on the Moon
   - The real terrain directly beneath the purchased parcel.
   - Uses the exact parcel outline with the thinner-border correction.

2. Your LunaScape Property
   - A virtual, user-friendly property preview inspired by the parcel's real terrain.
   - If a meaningful nearby attraction, city, or town context exists, it is reflected subtly in the scene.
   - If not, the view remains a simple lunar terrain image.

Updated files:
- components/LunaScapeImageGallery.tsx
- lib/property-image-renderer.ts
- app/api/property-image/[snapshotId]/route.ts
- lib/send-order-email.ts

No Prisma migration is required.
No npm install is required.
