"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PropertyConfigurator from "@/components/PropertyConfigurator/PropertyConfigurator";
import { useCart, type CartItem } from "@/context/CartContext";
import {
  CART_RESERVATION_COOKIE,
  parseReservationCookie,
} from "@/lib/cart-reservations";
import { sendAnalyticsEvent } from "@/lib/analytics";
import {
  ADDITIONAL_DEED_NAME_PRICE,
  ADDITIONAL_RURAL_ACRE_PRICE,
  getCanonicalPropertyAcreage,
  PASSPORT_PRICE,
  PROPERTY_PRICES,
  type PurchasablePropertyType,
} from "@/lib/purchase-constants";

type Product = {
  sku: string;
  propertyType: PurchasablePropertyType;
  name: string;
  category: string;
  promise: string;
  description: string;
  price: number;
  acres: number;
  image: string;
  mark: string;
  highlights: string[];
  idealFor: string;
  badge?: string;
  allowsAdditionalAcres?: boolean;
};

type AssignedProperty = {
  propertyId: string;
  propertyType: PurchasablePropertyType;
  stateName: string;
  cityName: string | null;
  townName: string | null;
  size: string;
  price: number;
  mapX: number;
  mapY: number;
};

type ConfiguratorForm = {
  ownerName: string;
  additionalOwner: string;
  quantity: number;
  additionalAcres: number;
  passportSelected: boolean;
  passportQuantity: number;
  isGift: boolean;
  recipientName: string;
  recipientEmail: string;
  giftMessage: string;
};

const products: Product[] = [
  {
    sku: "rural-one-acre",
    propertyType: "Rural Acre",
    name: "One-Acre Lunar Property",
    category: "Rural Acreage",
    promise: "Our classic lunar ownership experience.",
    description:
      "Claim a full acre within Orbital One's mapped lunar geography and create a property package designed to be displayed, shared, and remembered. Add adjoining acreage to build a larger commemorative holding.",
    price: PROPERTY_PRICES["Rural Acre"],
    acres: 1,
    image: "/property-images/rural-acre.jpg",
    mark: "1",
    highlights: [
      "One full novelty lunar acre",
      `Adjoining additional acres only $${ADDITIONAL_RURAL_ACRE_PRICE.toFixed(
        2
      )} each`,
      "Complete digital ownership collection",
    ],
    idealFor: "Families, collectors, milestones, and larger gifts",
    badge: "Most Popular",
    allowsAdditionalAcres: true,
  },
  {
    sku: "rural-half-acre",
    propertyType: "Half Acre",
    name: "Half-Acre Lunar Property",
    category: "Rural Acreage",
    promise: "A compact lunar keepsake at an accessible price.",
    description:
      "Reserve a half-acre commemorative lunar property with the same personalized ownership package, certificate record, and Charter HOA membership as every Orbital One property.",
    price: PROPERTY_PRICES["Half Acre"],
    acres: 0.5,
    image: "/property-images/rural-acre.jpg",
    mark: "1/2",
    highlights: [
      "One-half novelty lunar acre",
      "Personalized deed and purchase documents",
      "2026 Charter HOA membership included",
    ],
    idealFor: "Affordable gifts, first-time buyers, and keepsakes",
    badge: "Best Value",
  },
  {
    sku: "town-block",
    propertyType: "Town Block",
    name: "Lunar Town Block",
    category: "Town Property",
    promise: "A place within a named lunar community.",
    description:
      "Own a commemorative block inside one of LunaSphere's mapped towns. Town properties create a stronger sense of neighborhood, community identity, and future participation in the expanding LunaScape experience.",
    price: PROPERTY_PRICES["Town Block"],
    acres: 0,
    image: "/property-images/town-block.jpg",
    mark: "T",
    highlights: [
      "Located within a named lunar town",
      "Community-centered LunaScape presentation",
      "Priority access to future town experiences",
    ],
    idealFor: "Buyers who want community, identity, and connection",
  },
  {
    sku: "city-block",
    propertyType: "City Block",
    name: "Lunar City Block",
    category: "City Property",
    promise: "A premium address in a lunar city.",
    description:
      "Choose Orbital One's most prestigious property tier: a commemorative block within one of three named cities in a lunar state. It is designed for customers who want a bold, premium place in the LunaSphere story.",
    price: PROPERTY_PRICES["City Block"],
    acres: 0,
    image: "/property-images/city-block.jpg",
    mark: "C",
    highlights: [
      "Premium named-city location",
      "Distinctive city LunaScape presentation",
      "Founding recognition in a future lunar hub",
    ],
    idealFor: "Premium gifts, collectors, businesses, and visionaries",
    badge: "Premium",
  },
];

const initialForm: ConfiguratorForm = {
  ownerName: "",
  additionalOwner: "",
  quantity: 1,
  additionalAcres: 0,
  passportSelected: false,
  passportQuantity: 1,
  isGift: false,
  recipientName: "",
  recipientEmail: "",
  giftMessage: "",
};

const createCartId = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
function getReservationCartCount(): number {
  if (typeof document === "undefined") {
    return 0;
  }

  const cookiePrefix = `${CART_RESERVATION_COOKIE}=`;
  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(cookiePrefix))
    ?.slice(cookiePrefix.length);

  return parseReservationCookie(cookieValue).length;
}

export default function PricingPage() {
  const { addItem } = useCart();
  const [reservationCount, setReservationCount] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ConfiguratorForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");
  const [isAssigningProperty, setIsAssigningProperty] = useState(false);
  const [assignedProperty, setAssignedProperty] =
    useState<AssignedProperty | null>(null);
  useEffect(() => {
  const updateReservationCount = () => {
    setReservationCount(getReservationCartCount());
  };

  updateReservationCount();

  window.addEventListener("orbital-cart-updated", updateReservationCount);
  window.addEventListener("focus", updateReservationCount);
  window.addEventListener("pageshow", updateReservationCount);

  return () => {
    window.removeEventListener(
      "orbital-cart-updated",
      updateReservationCount
    );
    window.removeEventListener("focus", updateReservationCount);
    window.removeEventListener("pageshow", updateReservationCount);
  };
}, []);

  const configuredTotal = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }

    const passportTotal = form.passportSelected ? PASSPORT_PRICE : 0;

    const additionalNameTotal = form.additionalOwner.trim()
      ? ADDITIONAL_DEED_NAME_PRICE
      : 0;

    return selectedProduct.price + passportTotal + additionalNameTotal;
  }, [selectedProduct, form]);

  const openConfigurator = (product: Product) => {
    sendAnalyticsEvent("view_item", {
      currency: "USD",
      value: Number(product.price.toFixed(2)),
      items: [
        {
          item_id: product.sku,
          item_name: product.name,
          item_category: product.category,
          price: Number(product.price.toFixed(2)),
          quantity: 1,
        },
      ],
    });

    setSelectedProduct(product);
    setForm(initialForm);
    setFormError("");
    setAddedMessage("");
    setAssignedProperty(null);
    setIsAssigningProperty(false);
  };

  const closeConfigurator = () => {
    setSelectedProduct(null);
    setFormError("");
    setAssignedProperty(null);
    setIsAssigningProperty(false);
  };

  const handleAddConfiguredItem = async () => {
    if (!selectedProduct || isAssigningProperty || assignedProperty) {
      return;
    }

    if (!form.ownerName.trim()) {
      setFormError("Please enter the primary owner name.");
      return;
    }

    if (
      form.isGift &&
      (!form.recipientName.trim() || !form.recipientEmail.trim())
    ) {
      setFormError("Please enter the gift recipient’s name and email address.");
      return;
    }

    try {
      setIsAssigningProperty(true);
      setFormError("");
      setAddedMessage("");

      const response = await fetch("/api/quick-pick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyType: selectedProduct.propertyType,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        reservationId?: string;
        expiresAt?: string;
        property?: AssignedProperty;
      };

      if (
        !response.ok ||
        !data.reservationId ||
        !data.expiresAt ||
        !data.property
      ) {
        setFormError(
          data.error ||
            "We could not assign a property right now. Please try again."
        );
        return;
      }

      const property = data.property;

      const cartItem: CartItem = {
        id: createCartId(),
        propertyId: property.propertyId,
        propertyType: property.propertyType,
        category: selectedProduct.name,
        deedName: form.ownerName.trim(),
        ownerName: form.ownerName.trim(),
        additionalOwner: form.additionalOwner.trim() || undefined,
        lunarState: property.stateName,
        lunarCity: property.cityName || undefined,
        lunarTown: property.townName || undefined,
        acres: getCanonicalPropertyAcreage(property.propertyType) ?? 0,
        additionalAcres: 0,
        quantity: 1,
        unitPrice: selectedProduct.price,
        passportSelected: form.passportSelected,
        passportQuantity: 1,
        isGift: form.isGift,
        recipientName: form.isGift
          ? form.recipientName.trim()
          : undefined,
        recipientEmail: form.isGift
          ? form.recipientEmail.trim()
          : undefined,
        giftMessage:
          form.isGift && form.giftMessage.trim()
            ? form.giftMessage.trim()
            : undefined,
        reservationId: data.reservationId,
        reservationExpiresAt: data.expiresAt,
        mapX: property.mapX,
        mapY: property.mapY,
        image: selectedProduct.image,
      };

      addItem(cartItem);
      window.dispatchEvent(new Event("orbital-cart-updated"));

      sendAnalyticsEvent("add_to_cart", {
        currency: "USD",
        value: Number(configuredTotal.toFixed(2)),
        items: [
          {
            item_id: selectedProduct.sku,
            item_name: selectedProduct.name,
            item_category: selectedProduct.category,
            price: Number(configuredTotal.toFixed(2)),
            quantity: 1,
          },
        ],
      });

      setAssignedProperty(property);

      setAddedMessage(
        `${property.propertyId} has been selected, reserved, and added to your cart.`
      );
    } catch (error) {
      console.error("Unable to assign Quick Pick property:", error);

      setFormError(
        "Quick Pick could not connect to LunaSphere. Please try again."
      );
    } finally {
      setIsAssigningProperty(false);
    }
  };

  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-[#02040a] text-white"
    >
      <section className="relative isolate min-h-[700px] overflow-hidden border-b border-white/10 px-6 py-20 sm:py-24 lg:flex lg:min-h-[760px] lg:items-center">
        <Image
          src="/pricing/pricing-hero.png"
          alt="Photorealistic lunar landscape"
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-center"
        />

        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#02040a] via-[#02040a]/90 to-[#02040a]/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#02040a] via-transparent to-black/20" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-300/30 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,0.9)]" />
              Novelty Lunar Property Collection
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-8xl">
              Your place on the Moon begins here.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Choose a half acre, rural acre, town block, or premium city
              block—then personalize an Orbital One ownership experience built
              to be gifted, displayed, shared, and remembered.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-200">
              {[
                "Personalized deed",
                "Two LunaScape images",
                "Free Charter HOA membership",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#property-collection"
                className="rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-4 font-black text-black shadow-[0_16px_50px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5"
              >
                Choose Your Property
              </a>

              <Link
                href="/moon-map"
                className="rounded-xl border border-white/25 bg-black/30 px-7 py-4 font-black text-white backdrop-blur transition hover:border-yellow-300/50 hover:bg-black/50"
              >
                Explore the Moon Map
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/15 bg-black/55 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                  Every paid property includes
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  The Orbital One Collection
                </h2>
              </div>

              <Image
                src="/orbital-one-logo.png"
                alt="Orbital One Realty"
                width={190}
                height={53}
                className="hidden h-auto w-36 object-contain sm:block"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Personalized novelty deed"],
                ["02", "Exact property terrain image"],
                ["03", "LunaScape virtual property scene"],
                ["04", "Welcome and membership materials"],
                ["05", "2026 Charter HOA membership"],
                ["06", "Future member updates and priority access"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <span className="text-xs font-black text-yellow-400">
                    {number}
                  </span>

                  <span className="text-sm font-semibold leading-5 text-slate-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {reservationCount > 0 && (
              <Link
                href="/cart"
                className="mt-5 flex items-center justify-between rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-5 py-4 font-black text-yellow-100 transition hover:bg-yellow-300/15"
              >
                <span>View your cart ({reservationCount})</span>
                <span>Open Cart</span>
              </Link>
            )}
          </aside>
        </div>
      </section>

      <section id="property-collection" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
                Property Collection
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Choose the story you want to tell.
              </h2>
            </div>

            <p className="max-w-3xl text-lg leading-8 text-slate-400 lg:justify-self-end">
              Every tier offers the same polished Orbital One ownership
              experience. The difference is where your commemorative property
              lives within LunaSphere—from peaceful rural terrain to a named
              town or premium city.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.sku}
                className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-yellow-300/35"
              >
                <div className="relative h-64 overflow-hidden sm:h-72">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-black/5 to-black/20" />

                  <div className="absolute left-5 top-5 flex max-w-[calc(100%-2.5rem)] items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-yellow-200/60 bg-black/65 text-xl font-black text-yellow-200 shadow-xl backdrop-blur">
                      {product.mark}
                    </div>

                    <div className="rounded-full border border-white/20 bg-black/65 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-xl backdrop-blur">
                      {product.category}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7 sm:p-8 lg:p-9">
                  <div className="flex flex-wrap items-center gap-3">
                    {product.badge && (
                      <span className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-yellow-400/10">
                        {product.badge}
                      </span>
                    )}

                    <span className="text-sm font-bold leading-6 text-yellow-300">
                      {product.promise}
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                    {product.name}
                  </h3>

                  <p className="mt-5 text-base leading-7 text-slate-400">
                    {product.description}
                  </p>

                  <ul className="mt-7 space-y-3">
                    {product.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-4"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-sm font-black text-yellow-300">
                          ✓
                        </span>

                        <span className="text-sm font-semibold leading-6 text-slate-200">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-sm leading-6 text-slate-500">
                    <strong className="text-slate-300">Best for:</strong>{" "}
                    {product.idealFor}
                  </p>

                  <div className="mt-auto pt-8">
                    <div className="border-t border-white/10 pt-7">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                            Starting at
                          </p>

                          <p className="mt-2 text-4xl font-black text-white sm:text-5xl">
                            ${product.price.toFixed(2)}
                          </p>

                          {product.allowsAdditionalAcres && (
                            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                              Adjoining additional acres: $
                              {ADDITIONAL_RURAL_ACRE_PRICE.toFixed(2)} each
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openConfigurator(product)}
                          className="w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-6 py-4 text-center font-black text-black transition hover:-translate-y-0.5 hover:from-yellow-200 hover:to-yellow-400 sm:w-auto sm:min-w-56"
                        >
                          Quick Pick &amp; Personalize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
              More than a deed
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              A complete ownership experience.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Orbital One turns a novelty lunar property into a polished
              collection of personal documents, imagery, recognition, and
              future member experiences.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                number: "01",
                title: "Personalized Ownership",
                description:
                  "A custom novelty deed and coordinated purchase documents featuring the selected owner's name and property information.",
              },
              {
                number: "02",
                title: "Your Two LunaScape Images",
                description:
                  "Receive the real parcel-based terrain view plus a polished virtual-property scene designed for the LunaScape experience.",
              },
              {
                number: "03",
                title: "2026 Charter HOA Membership",
                description:
                  "Early customers receive founding recognition, member communications, future discounts, and priority access to new features.",
              },
              {
                number: "04",
                title: "A Future That Keeps Growing",
                description:
                  "Your account is built for future property enhancements, virtual homes, communities, member recognition, and LunaScape experiences.",
              },
            ].map((feature) => (
              <article
                key={feature.number}
                className="rounded-3xl border border-white/10 bg-black/25 p-7"
              >
                <p className="text-sm font-black tracking-[0.2em] text-yellow-400">
                  {feature.number}
                </p>

                <h3 className="mt-5 text-xl font-black">{feature.title}</h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-yellow-300/25 bg-gradient-to-br from-yellow-300/12 via-white/[0.04] to-transparent p-8 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
              Free with purchase
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Your 2026 Charter HOA membership.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Your membership is not a throwaway certificate. It is your
              ongoing connection to Orbital One and the growing LunaScape
              community.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Emailed lunar newsletters and product updates",
                "Founding-member recognition",
                "Future discounts and member offers",
                "Early access to new LunaScape features",
                "Virtual-property enhancement opportunities",
                "Priority access to future communities",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-slate-200"
                >
                  <span className="mr-2 text-yellow-400">✓</span>
                  {benefit}
                </div>
              ))}
            </div>

            <Link
              href="/hoa"
              className="mt-8 inline-flex rounded-xl border border-yellow-300/40 px-6 py-3 font-black text-yellow-200 transition hover:bg-yellow-300/10"
            >
              Explore HOA Membership
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
              Simple Mission Plan
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              From selection to celebration.
            </h2>

            <div className="mt-8 space-y-6">
              {[
                [
                  "1",
                  "Choose your property tier",
                  "Select rural acreage, a town block, or a premium city block based on the experience you want.",
                ],
                [
                  "2",
                  "Personalize the ownership package",
                  "Add the owner's name, gift details, optional additional acreage, and novelty lunar passports.",
                ],
                [
                  "3",
                  "Receive your Orbital One collection",
                  "After checkout, your ownership materials, account records, and LunaScape property images are prepared automatically.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="grid grid-cols-[3rem_1fr] gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 font-black text-yellow-300">
                    {number}
                  </div>

                  <div>
                    <h3 className="text-lg font-black">{title}</h3>

                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Image
            src="/orbital-one-logo.png"
            alt="Orbital One Realty"
            width={360}
            height={101}
            className="mx-auto h-auto w-64 sm:w-80"
          />

          <h2 className="mt-9 text-4xl font-black sm:text-5xl">
            It’s fun. It’s unique.
            <span className="block text-yellow-400">
              It’s out of this world!
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Choose a property that fits the moment, then personalize an
            Orbital One experience they will never forget.
          </p>

          <a
            href="#property-collection"
            className="mt-9 inline-flex rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-8 py-4 font-black text-black"
          >
            Choose Your Lunar Property
          </a>

          <p className="mx-auto mt-12 max-w-3xl text-xs leading-6 text-slate-600">
            Orbital One Realty products are novelty and entertainment products.
            They do not represent legal ownership of land or real estate on the
            Moon and are not government-recognized property titles.
          </p>
        </div>
      </section>

      <PropertyConfigurator
        open={selectedProduct !== null}
        onClose={closeConfigurator}
        propertyName={selectedProduct?.name ?? "Lunar Property"}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="relative h-48">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="720px"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-yellow-200/60 bg-black/60 text-xl font-black text-yellow-200 backdrop-blur">
                    {selectedProduct.mark}
                  </div>

                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-400">
                      {selectedProduct.category}
                    </p>

                    <h3 className="mt-1 text-2xl font-black">
                      {selectedProduct.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-300">
                      Base price ${selectedProduct.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-lg font-bold">Owner Information</h3>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Primary owner name *
                  </span>

                  <input
                    value={form.ownerName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ownerName: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-yellow-400"
                    placeholder="Name shown on the deed"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Additional owner
                  </span>

                  <input
                    value={form.additionalOwner}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        additionalOwner: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-yellow-400"
                    placeholder="Optional second name"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-lg font-bold">Property Options</h3>

              <div className="mt-5 space-y-5">
                <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                  <p className="font-black text-emerald-200">
                    One real property will be assigned
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Quick Pick securely chooses one currently available Grid V2
                    property from this category and reserves it before it enters
                    your cart.
                  </p>
                </div>

                {selectedProduct.allowsAdditionalAcres && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
                    Looking for adjoining acreage? Use the Moon Map to choose
                    connected parcels and build a larger holding.

                    <Link
                      href="/moon-map"
                      className="ml-2 font-black text-yellow-300"
                    >
                      Choose adjoining parcels →
                    </Link>
                  </div>
                )}

                <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    checked={form.passportSelected}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        passportSelected: event.target.checked,
                      }))
                    }
                    className="mt-1 h-5 w-5 accent-yellow-400"
                  />

                  <span>
                    <span className="block font-semibold">
                      Add Lunar Passport
                    </span>

                    <span className="mt-1 block text-sm text-slate-400">
                      Personalized novelty passport · $
                      {PASSPORT_PRICE.toFixed(2)} each
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={form.isGift}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isGift: event.target.checked,
                    }))
                  }
                  className="mt-1 h-5 w-5 accent-yellow-400"
                />

                <span>
                  <span className="block text-lg font-bold">
                    This is a gift
                  </span>

                  <span className="mt-1 block text-sm text-slate-400">
                    Add recipient details and an optional personal message.
                  </span>
                </span>
              </label>

              {form.isGift && (
                <div className="mt-5 space-y-4">
                  <input
                    value={form.recipientName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        recipientName: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-yellow-400"
                    placeholder="Recipient name"
                  />

                  <input
                    type="email"
                    value={form.recipientEmail}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        recipientEmail: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-yellow-400"
                    placeholder="Recipient email"
                  />

                  <textarea
                    value={form.giftMessage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        giftMessage: event.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-yellow-400"
                    placeholder="Optional gift message"
                  />
                </div>
              )}
            </section>

            <section className="relative rounded-2xl border border-yellow-300/25 bg-slate-950/95 p-6 shadow-2xl">
              <h3 className="text-lg font-bold">Order Summary</h3>

              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow
                  label={selectedProduct.name}
                  value={selectedProduct.price}
                />

                {form.additionalOwner.trim() && (
                  <SummaryRow
                    label="Additional deed name"
                    value={ADDITIONAL_DEED_NAME_PRICE}
                  />
                )}

                {form.passportSelected && (
                  <SummaryRow
                    label="Lunar Passport"
                    value={PASSPORT_PRICE}
                  />
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-lg font-bold">Total</span>

                <span className="text-3xl font-black text-yellow-400">
                  ${configuredTotal.toFixed(2)}
                </span>
              </div>

              {formError && (
                <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {formError}
                </p>
              )}

              {addedMessage && (
                <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
                  <p className="font-black">Property secured!</p>

                  <p className="mt-1 break-all">{addedMessage}</p>

                  {assignedProperty && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href="/cart"
                        className="rounded-lg bg-emerald-300 px-4 py-2 font-black text-emerald-950"
                      >
                        View Cart
                      </Link>

                      <Link
                        href={`/moon-map?property=${encodeURIComponent(
                          assignedProperty.propertyId
                        )}`}
                        className="rounded-lg border border-emerald-200/30 px-4 py-2 font-black"
                      >
                        View on Moon Map
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddConfiguredItem}
                disabled={isAssigningProperty || Boolean(assignedProperty)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-6 py-4 font-black text-black transition hover:from-yellow-200 hover:to-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAssigningProperty
                  ? "Searching LunaSphere & Reserving…"
                  : assignedProperty
                    ? "Property Reserved & Added"
                    : "Assign My Property & Add to Cart"}
              </button>

              <button
                type="button"
                onClick={closeConfigurator}
                className="mt-3 w-full rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
              >
                Continue Shopping
              </button>
            </section>
          </div>
        )}
      </PropertyConfigurator>
    </main>
  );
}

type SummaryRowProps = {
  label: string;
  value: number;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 text-slate-400">
      <span>{label}</span>

      <span className="shrink-0 font-semibold text-white">
        ${value.toFixed(2)}
      </span>
    </div>
  );
}