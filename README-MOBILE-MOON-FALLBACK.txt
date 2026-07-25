Orbital One mobile Moon imagery fallback

Updated file:
- components/LunarLeafletMap.tsx

What changed:
- The full Moon atlas image is now always mounted beneath the high-resolution LROC tile layer.
- Desktop and capable mobile browsers still receive the high-resolution tiles.
- When mobile tile loading is delayed, interrupted, or rejected, the aligned Moon image remains visible behind state, city, town, attraction, and parcel boundaries.
- No parcel IDs, boundaries, reservations, inventory, Stripe logic, or map controls were changed.
