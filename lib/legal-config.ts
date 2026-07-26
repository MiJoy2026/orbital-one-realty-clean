export const LEGAL_POLICY_VERSION = "2026-07-25";
export const LEGAL_EFFECTIVE_DATE = "July 25, 2026";

export const LEGAL_ENTITY = {
  legalName: "MiJoy Enterprises LLC",
  brandName: "Orbital One Realty™",
  email: "mijoyenterprises@gmail.com",
  addressLines: [
    "8435 Hollow Brook Circle",
    "Naples, Florida 34119",
    "United States",
  ],
} as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
  { href: "/cookies", label: "Cookies" },
  { href: "/shipping-delivery", label: "Digital Delivery" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/legal-notice", label: "Legal Notice" },
] as const;
