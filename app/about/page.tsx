import Link from "next/link";
import { Shield, Layers, Truck } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust",
    desc: "Every seller is verified, and every transaction is secure. Shop with confidence knowing your purchases are protected.",
  },
  {
    icon: Layers,
    title: "Variety",
    desc: "From everyday essentials to seasonal specials, our marketplace brings together thousands of products in one place.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "We partner with trusted courier services across Bangladesh to ensure your orders arrive quickly and safely.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">About KGStore</h1>
          <p className="text-base text-text/60 max-w-2xl mx-auto leading-relaxed">
            KGStore is a multi-vendor marketplace built for Bangladesh&mdash;connecting
            trusted sellers with customers who value quality, variety, and reliable delivery
            across every season.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-6">Our Mission</h2>
            <p className="text-sm text-text/60 leading-relaxed mb-6">
              We believe shopping should be simple, trustworthy, and accessible to everyone.
              KGStore was built to give small and medium sellers a platform to reach more
              customers, while giving buyers a curated selection of products they can count on.
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-6">Why We Started</h2>
            <p className="text-sm text-text/60 leading-relaxed">
              Bangladesh has a vibrant community of entrepreneurs and makers, but many lack
              the tools to sell online effectively. KGStore was created to bridge that gap&mdash;offering
              sellers an easy way to set up shop and giving buyers a seamless experience to
              discover and order products they love, rain or shine.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-text text-center mb-10">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="neu-flat p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">{v.title}</h3>
                  <p className="text-sm text-text/50 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface/30">
        <div className="container mx-auto px-4 text-center">
          <div className="neu-flat max-w-xl mx-auto p-10">
            <h2 className="text-2xl font-bold text-text mb-4">
              Ready to explore?
            </h2>
            <p className="text-sm text-text/50 mb-8">
              Browse thousands of products from trusted sellers across Bangladesh.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
