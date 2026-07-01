const faqs = [
  {
    question: "Do I legally own land on the Moon?",
    answer:
      "No. Orbital One Realty sells novelty and commemorative products only. Purchases do not convey legal ownership of lunar real estate.",
  },
  {
    question: "What comes with my purchase?",
    answer:
      "Each paid property purchase includes a novelty deed, property picture, nearby attractions list, HOA membership, Future access to our Virtual Lunar app where you can build your property, Terms & Conditions, and Privacy Policy.",
  },
  {
    question: "Can I add names to the deed?",
    answer:
      "Yes. Recipient names can be added to the novelty deed.",
  },
  {
    question: "What is a Novelty Lunar Passport?",
    answer:
      "It is a fun commemorative add-on item for $4.99. It is not government-issued identification and cannot be used for travel.",
  },
  {
    question: "Are sold properties still available?",
    answer:
      "No. Sold properties will be marked as sold and unavailable for purchase.",
  },
  { question: "What is included with my HOA Membership?",
    answer:
      "You will become a member of our Lunar Community.  Your HOA membership will give you access to our Virtual Lunar App, where you will be able to build and explore your purchased properties.  The Virtual Lunar App will be coming soon!",
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Frequently Asked Questions
        </h1>

        <div className="mt-12 space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-white/20 p-6"
            >
              <h2 className="text-2xl font-bold text-yellow-400">
                {faq.question}
              </h2>
              <p className="mt-3 text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}