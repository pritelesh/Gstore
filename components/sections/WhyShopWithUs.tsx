import { Store, Package, TrendingUp, Shield } from "lucide-react";

const features = [
  { icon: Store, label: "Multi-Vendor", desc: "Hundreds of trusted sellers" },
  { icon: Package, label: "Seasonal Picks", desc: "Rainy, summer & winter" },
  { icon: TrendingUp, label: "Best Prices", desc: "Shop & compare deals" },
  { icon: Shield, label: "Safe & Secure", desc: "Protected transactions" },
];

export default function WhyShopWithUs() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="neu-flat flex items-center gap-4 px-6 py-4 w-56"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text">{f.label}</p>
                  <p className="text-xs text-text/50">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
