import Link from "next/link";

export default function CreateStoreCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="neu-flat p-10 md:p-14 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
            Become a Seller
          </h2>
          <p className="text-sm text-text/60 mb-8 leading-relaxed max-w-md mx-auto">
            Start selling on KGStore in minutes. Create your store, list your products,
            and reach customers across Bangladesh.
          </p>
          <Link
            href="/seller"
            className="inline-block px-8 py-3.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Create Your Store
          </Link>
        </div>
      </div>
    </section>
  );
}
