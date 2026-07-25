ORBITAL ONE QUICK PICK PROPERTY ASSIGNMENT

This upgrade adds a real inventory-backed Quick Pick flow.

What it does:
- Selects a valid active Grid V2 Rural Acre, Town Block, or City Block.
- Rejects sold and actively reserved properties.
- Uses a PostgreSQL advisory lock to prevent simultaneous double reservation.
- Creates the same timed PropertyReservation used by the Moon Map.
- Adds the actual property ID, location, reservation ID, and expiration to the cart.
- Releases the database reservation when a customer removes the cart item.
- Provides a secure checkout handoff compatible with single- and multi-reservation checkout routes.

Quick Pick intentionally assigns one property per click. Customers seeking adjoining rural acreage are directed to the Moon Map so connected parcels can be selected accurately.

Files:
- app/api/quick-pick/route.ts
- app/api/release-reservation/route.ts
- app/pricing/page.tsx
- app/cart/page.tsx
- components/QuickPickCheckoutButton.tsx
- context/CartContext.tsx

No Prisma migration and no npm install are required.
