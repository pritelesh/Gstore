import Link from "next/link";

const couriers = ["Pathao", "Steadfast", "RedX"];

export default function DeliverySection() {
  return (
    <section className="py-16 md:py-24 bg-surface/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-8">
          We Deliver With
        </h2>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {couriers.map((courier) => (
            <span
              key={courier}
              className="neu-flat px-6 py-3 text-sm font-semibold text-text"
            >
              {courier}
            </span>
          ))}
        </div>
        <p className="text-sm text-text/60 mb-6">
          Track your order anytime
        </p>
        <Link
          href="/track"
          className="inline-block px-8 py-3.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          Track Order
        </Link>
      </div>
    </section>
  );
}
