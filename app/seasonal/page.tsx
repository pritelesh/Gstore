import Link from "next/link";
import Image from "next/image";

const seasons = [
  {
    slug: "rainy",
    name: "Rainy",
    image: "https://placehold.co/600x400/2F3D9A/FAFFC4?text=Rainy+Collection",
    description: "Umbrellas, raincoats, waterproof gear & more for the wet season.",
  },
  {
    slug: "summer",
    name: "Summer",
    image: "https://placehold.co/600x400/2F3D9A/FAFFC4?text=Summer+Collection",
    description: "Cool clothing, fans, sunglasses, and summer essentials.",
  },
  {
    slug: "winter",
    name: "Winter",
    image: "https://placehold.co/600x400/2F3D9A/FAFFC4?text=Winter+Collection",
    description: "Jackets, hoodies, blankets, and warm winter wear.",
  },
];

export default function SeasonalPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-text text-center mb-4">
          Seasonal Collections
        </h1>
        <p className="text-sm text-text/60 text-center mb-12 max-w-lg mx-auto">
          Browse products curated for every season. Rainy, summer, or winter&mdash;find
          what you need.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {seasons.map((season) => (
            <Link
              key={season.slug}
              href={`/seasonal/${season.slug}`}
              className="neu-flat p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[8px_12px_24px_rgba(0,0,0,0.5),-8px_-8px_20px_rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden">
                <Image
                  src={season.image}
                  alt={season.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <div className="mt-5">
                <h2 className="text-xl font-bold text-text">{season.name}</h2>
                <p className="text-sm text-text/50 mt-2 leading-relaxed">
                  {season.description}
                </p>
                <span className="inline-block mt-4 px-5 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all">
                  View Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
