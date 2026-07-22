"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PropertyConfigurator from "../../components/PropertyConfigurator/PropertyConfigurator";
import { useCart, type CartItem } from "../../context/CartContext";

type Product = {
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  acres: number;
  icon: string;
  badge?: string;
  allowsAdditionalAcres?: boolean;
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

const ADDITIONAL_ACRE_PRICE = 7.95;
const PASSPORT_PRICE = 4.99;

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

export default function PricingPage() {
  const { addItem, itemCount, subtotal } = useCart();

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ConfiguratorForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const products: Product[] = [
    {
      sku: "rural-one-acre",
      name: "One-Acre Lunar Property",
      category: "Rural Acreage",
      description:
        "Our classic lunar property package, complete with personalized ownership documents and HOA membership.",
      price: 24.95,
      acres: 1,
      icon: "🌕",
      badge: "Most Popular",
      allowsAdditionalAcres: true,
    },
    {
      sku: "town-block",
      name: "Lunar Town Block",
      category: "Town Property",
      description:
        "Own a novelty block located within one of the twenty named towns found in each lunar state.",
      price: 39.95,
      acres: 0,
      icon: "🏘️",
    },
    {
      sku: "city-block",
      name: "Lunar City Block",
      category: "City Property",
      description:
        "A premium novelty property located within one of three distinguished cities in a lunar state.",
      price: 54.95,
      acres: 0,
      icon: "🌆",
      badge: "Premium",
    },
  ];

  const configuredTotal = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }

    const quantity = Math.max(1, form.quantity);

    const baseTotal = selectedProduct.price * quantity;

    const additionalAcreTotal = selectedProduct.allowsAdditionalAcres
      ? form.additionalAcres * ADDITIONAL_ACRE_PRICE * quantity
      : 0;

    const passportTotal = form.passportSelected
      ? Math.max(1, form.passportQuantity) * PASSPORT_PRICE
      : 0;

    return baseTotal + additionalAcreTotal + passportTotal;
  }, [selectedProduct, form]);

  const openConfigurator = (product: Product) => {
    setSelectedProduct(product);
    setForm(initialForm);
    setFormError("");
    setAddedMessage("");
  };

  const closeConfigurator = () => {
    setSelectedProduct(null);
    setFormError("");
  };

  const updateNumber = (
    field: "quantity" | "additionalAcres" | "passportQuantity",
    change: number,
    minimum: number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: Math.max(minimum, current[field] + change),
    }));
  };

  const handleAddConfiguredItem = () => {
    if (!selectedProduct) {
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
      setFormError(
        "Please enter the gift recipient’s name and email address."
      );
      return;
    }

    const cartItem: CartItem = {
      id: createCartId(),
      propertyId: selectedProduct.sku,
      propertyType: selectedProduct.name,
      category: selectedProduct.category,
      deedName: form.ownerName.trim(),
      ownerName: form.ownerName.trim(),
      additionalOwner: form.additionalOwner.trim() || undefined,
      lunarState: "Selected during property assignment",
      acres: selectedProduct.acres,
      additionalAcres: selectedProduct.allowsAdditionalAcres
        ? form.additionalAcres
        : 0,
      quantity: form.quantity,
      unitPrice: selectedProduct.price,
      passportSelected: form.passportSelected,
      passportQuantity: form.passportSelected
        ? form.passportQuantity
        : 1,
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
    };

    addItem(cartItem);
    setAddedMessage(`${selectedProduct.name} was added to your cart.`);
    setFormError("");

    window.setTimeout(() => {
      closeConfigurator();
    }, 900);
  };

  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-[#03050b] text-white"
    >
      <section className="relative border-b border-white/10 px-6 py-20 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.14),_transparent_38%)]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
            <span>✦</span>
            Novelty Lunar Property Packages
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Find Your Place
            <span className="block bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              On the Moon
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Choose a property package, personalize it in Mission Control, and
            add it to your cart when every detail is just right.
          </p>

          {itemCount > 0 && (
            <Link
              href="/cart"
              className="mt-9 inline-flex items-center gap-3 rounded-xl border border-yellow-300/40 bg-yellow-300/10 px-6 py-3 font-semibold text-yellow-200 transition hover:bg-yellow-300/20"
            >
              🛒 View Cart ({itemCount}) · ${subtotal.toFixed(2)}
            </Link>
          )}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
              Property Collection
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Choose your lunar property
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Each package can be personalized with owner information, gift
              details, additional acreage where available, and an optional
              lunar passport.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.sku}
                className="group relative flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.025] shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-2 hover:border-yellow-300/40"
              >
                {product.badge && (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                    {product.badge}
                  </div>
                )}

                <div className="relative flex h-44 items-center justify-center border-b border-white/10 bg-gradient-to-br from-slate-800 via-slate-950 to-black">
                  <div className="absolute h-40 w-40 rounded-full bg-yellow-200/10 blur-2xl transition duration-500 group-hover:bg-yellow-200/20" />

                  <span className="relative text-7xl transition duration-500 group-hover:scale-110">
                    {product.icon}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
                    {product.category}
                  </p>

                  <h3 className="mt-3 text-2xl font-bold leading-tight">
                    {product.name}
                  </h3>

                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                    {product.description}
                  </p>

                  <div className="mt-7 border-t border-white/10 pt-6">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Starting at
                    </p>

                    <p className="mt-1 text-4xl font-black">
                      ${product.price.toFixed(2)}
                    </p>

                    <button
                      type="button"
                      onClick={() => openConfigurator(product)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-3.5 font-bold text-black transition hover:from-yellow-200 hover:to-yellow-400"
                    >
                      Configure Package
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5 text-center text-sm leading-6 text-slate-400">
            Additional acres are available with the one-acre rural property
            package for{" "}
            <strong className="text-white">$7.95 each</strong>.
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
              Included With Property Purchases
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              A complete lunar ownership experience
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "📜",
                title: "Personalized Deed",
                description:
                  "A customized novelty deed featuring the owner’s selected name.",
              },
              {
                icon: "🏅",
                title: "Charter HOA Membership",
                description:
                  "Recognition as a 2026 Founding and Charter HOA Member.",
              },
              {
                icon: "📦",
                title: "Welcome Materials",
                description:
                  "Coordinated property, ownership, and membership documents.",
              },
              {
                icon: "🚀",
                title: "Future Benefits",
                description:
                  "Updates, recognition, discounts, and priority access to future features.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-300/10 text-2xl">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-5xl">🌕</span>

          <h2 className="mt-6 text-3xl font-black sm:text-4xl">
            It’s fun. It’s unique.
            <span className="block text-yellow-400">
              It’s out of this world!
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Choose your package and use Mission Control to personalize the
            complete ownership experience.
          </p>

          <p className="mx-auto mt-10 max-w-3xl text-xs leading-5 text-slate-600">
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
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-300/10 text-4xl">
                  {selectedProduct.icon}
                </div>

                <div>
                  <p className="text-sm text-yellow-400">
                    {selectedProduct.category}
                  </p>

                  <h3 className="text-xl font-bold">
                    {selectedProduct.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Base price ${selectedProduct.price.toFixed(2)}
                  </p>
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
                <Counter
                  label="Package quantity"
                  value={form.quantity}
                  onDecrease={() => updateNumber("quantity", -1, 1)}
                  onIncrease={() => updateNumber("quantity", 1, 1)}
                />

                {selectedProduct.allowsAdditionalAcres && (
                  <Counter
                    label={`Additional acres · $${ADDITIONAL_ACRE_PRICE.toFixed(
                      2
                    )} each`}
                    value={form.additionalAcres}
                    onDecrease={() =>
                      updateNumber("additionalAcres", -1, 0)
                    }
                    onIncrease={() =>
                      updateNumber("additionalAcres", 1, 0)
                    }
                  />
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

                {form.passportSelected && (
                  <Counter
                    label="Passport quantity"
                    value={form.passportQuantity}
                    onDecrease={() =>
                      updateNumber("passportQuantity", -1, 1)
                    }
                    onIncrease={() =>
                      updateNumber("passportQuantity", 1, 1)
                    }
                  />
                )}
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

            <section className="sticky bottom-0 rounded-2xl border border-yellow-300/25 bg-slate-950/95 p-6 shadow-2xl backdrop-blur">
              <h3 className="text-lg font-bold">Order Summary</h3>

              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow
                  label={`${selectedProduct.name} × ${form.quantity}`}
                  value={selectedProduct.price * form.quantity}
                />

                {selectedProduct.allowsAdditionalAcres &&
                  form.additionalAcres > 0 && (
                    <SummaryRow
                      label={`${form.additionalAcres} additional acre${
                        form.additionalAcres === 1 ? "" : "s"
                      }`}
                      value={
                        form.additionalAcres *
                        ADDITIONAL_ACRE_PRICE *
                        form.quantity
                      }
                    />
                  )}

                {form.passportSelected && (
                  <SummaryRow
                    label={`Lunar Passport × ${form.passportQuantity}`}
                    value={form.passportQuantity * PASSPORT_PRICE}
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
                <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {addedMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleAddConfiguredItem}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-6 py-4 font-black text-black transition hover:from-yellow-200 hover:to-yellow-400"
              >
                Add Configured Package to Cart
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

type CounterProps = {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

function Counter({
  label,
  value,
  onDecrease,
  onIncrease,
}: CounterProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <span className="text-sm font-medium text-slate-300">{label}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrease}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg transition hover:bg-white/10"
        >
          −
        </button>

        <span className="min-w-8 text-center text-lg font-bold">{value}</span>

        <button
          type="button"
          onClick={onIncrease}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg transition hover:bg-white/10"
        >
          +
        </button>
      </div>
    </div>
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