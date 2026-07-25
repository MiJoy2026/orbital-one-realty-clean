Quick Pick Configurator Layout Hotfix

Fixes the Order Summary overlay in the Pricing-page Mission Control drawer.

Cause:
- The summary used `sticky bottom-0`, causing it to remain over the deed-owner and option fields while the drawer scrolled.

Fix:
- The summary is now a normal final section in the configurator flow.
- No reservation, cart, pricing, or checkout logic is changed.

Updated file:
- app/pricing/page.tsx
