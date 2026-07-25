Orbital One Realty — Mobile Moon Pane Hotfix

Fixes:
- Replaces the mismatched PNG-data/.jpg fallback with a genuine optimized JPEG.
- Mounts the fallback in a dedicated Leaflet pane below terrain tiles and vector overlays.
- Prevents the fallback image from covering boundaries or blanking the mobile map.
- Preserves all current LunaSphere geography, inventory, reservations, and map controls.

Updated files:
- components/LunarLeafletMap.tsx
- public/atlas/moon-atlas-mobile.jpg
