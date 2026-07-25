This hotfix corrects the LunaScape two-image experience.

Fixes included:
- The second image no longer reuses the old crescent/tiled postcard renderer.
- A dedicated virtual property renderer is now used for "Your LunaScape Property".
- The UI is cleaned up to use one shared action bar instead of cluttered duplicate download buttons.

Updated files:
- lib/property-image-renderer.ts
- components/LunaScapeImageGallery.tsx
- app/api/property-image/[snapshotId]/route.ts
