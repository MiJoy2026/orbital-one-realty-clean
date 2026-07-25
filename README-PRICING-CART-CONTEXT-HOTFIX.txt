Orbital One Pricing Cart Context Hotfix

Purpose:
- Keep exactly one global CartProvider.
- Ensure the provider wraps both the header and all route content.
- Standardize every cart import to @/context/CartContext so Turbopack resolves one shared context module.
- Preserve the no-half-acre Pricing Page redesign.

Updated files:
- app/layout.tsx
- app/pricing/page.tsx
- app/cart/page.tsx
- components/CartButton.tsx

No Prisma migration or npm install is required.
