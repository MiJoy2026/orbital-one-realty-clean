Orbital One Realty mobile Moon imagery hotfix

This restores the current LunaSphere geography-aware LunarLeafletMap component and adds the mobile-safe Moon base image beneath the high-resolution LROC tile layer.

The previous fallback package accidentally replaced the current component with an older prop signature. This package preserves mapRegions, publicSettlements, publicProtectedAreas, frozen geography, inventory Grid V2, reservations, city/town blocks, and all current map behavior.

Updated file:
- components/LunarLeafletMap.tsx
