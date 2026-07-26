import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-3/5 text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-text leading-none tracking-tight">
              KGStore
            </h1>
            <p className="mt-4 text-base sm:text-lg text-text/60 max-w-md mx-auto md:mx-0 leading-relaxed">
              Your marketplace for every season — from everyday essentials to
              rainy, summer, and winter collections.
            </p>
            <Link
              href="/products"
              className="inline-block mt-8 px-8 py-3.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Shop Now
            </Link>
          </div>

          <div className="w-full md:w-2/5">
            <Link
              href="/seasonal"
              className="neu-flat block p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[8px_12px_24px_rgba(0,0,0,0.5),-8px_-8px_20px_rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src="https://placehold.co/600x450/2F3D9A/FAFFC4?text=Seasonal+Products"
                  alt="Seasonal Products"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-text">Seasonal Products</h3>
                <p className="text-sm text-text/50 mt-1">
                  Explore rainy, summer &amp; winter picks
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
