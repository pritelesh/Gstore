import Link from "next/link";
import { Package, Truck, Building2, Ship } from "lucide-react";

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Track Order", href: "/track-order" },
  { label: "Create Your Store", href: "/sell" },
  { label: "Contact", href: "/about" },
];

const courierPartners = [
  { icon: Truck, label: "Courier A" },
  { icon: Package, label: "Courier B" },
  { icon: Building2, label: "Courier C" },
  { icon: Ship, label: "Courier D" },
];

export default function Footer() {
  return (
    <footer className="bg-surface/50 border-t border-white/5">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-text">
              KGStore
            </Link>
            <p className="mt-3 text-sm text-text/50 max-w-xs leading-relaxed">
              Your trusted multi-vendor marketplace. Shop from hundreds of sellers
              across Bangladesh.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text/60 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Our Courier Partners</h3>
            <div className="flex flex-wrap gap-3">
              {courierPartners.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.label}
                    className="neu-flat px-4 py-3 flex items-center gap-2 text-text/50"
                  >
                    <Icon size={18} />
                    <span className="text-xs font-medium">{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-xs text-text/30">
            &copy; {new Date().getFullYear()} KGStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
