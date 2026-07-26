import Link from "next/link";
import { Store, Package, TrendingUp, Shield } from "lucide-react";

const benefits = [
  {
    icon: Store,
    title: "Create Your Store",
    desc: "Set up your online store in minutes. No technical skills needed.",
  },
  {
    icon: Package,
    title: "List Products Easily",
    desc: "Upload products with images, categories, and seasonal tagging.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    desc: "Reach thousands of customers shopping on KGStore every day.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Safe payments, cashout on demand, and dedicated seller support.",
  },
];

export default function SellLandingPage() {
  return (
    <>
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
            Create Your Own Store on KGStore
          </h1>
          <p className="text-lg text-text/60 max-w-2xl mx-auto mb-10">
            Join hundreds of sellers and start selling your products to a growing community
            of customers. No upfront fees, easy setup, and full control over your store.
          </p>
          <Link
            href="/sell/register"
            className="inline-block px-8 py-3.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Get Started &mdash; It&apos;s Free
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-text text-center mb-10">
            Why Sell on KGStore?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="neu-flat p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">{b.title}</h3>
                  <p className="text-sm text-text/50 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="neu-flat max-w-2xl mx-auto p-10">
            <h2 className="text-2xl font-bold text-text mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-sm text-text/50 mb-8 leading-relaxed max-w-md mx-auto">
              Register your store today and start listing products. It takes just a few
              minutes to get started.
            </p>
            <Link
              href="/sell/register"
              className="inline-block px-8 py-3.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Create Your Store Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
