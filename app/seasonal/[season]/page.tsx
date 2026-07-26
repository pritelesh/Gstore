import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductsBySeason } from "@/lib/actions/products";

const validSeasons = ["rainy", "summer", "winter"] as const;

interface Props {
  params: { season: string };
}

const seasonNames: Record<string, string> = {
  rainy: "Rainy",
  summer: "Summer",
  winter: "Winter",
};

export default async function SeasonPage({ params }: Props) {
  const season = params.season.toLowerCase();

  if (!validSeasons.includes(season as typeof validSeasons[number])) {
    notFound();
  }

  const products = await getProductsBySeason(season);
  const displayName = seasonNames[season];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/seasonal"
            className="text-sm text-text/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg transition-colors"
          >
            &larr; All Seasons
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-text capitalize mb-2">
          {displayName} Collection
        </h1>
        <p className="text-sm text-text/60 mb-10">
          {products.length} product{products.length !== 1 ? "s" : ""} available
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="neu-flat p-4 flex flex-col">
              <Link
                href={`/products/${product.id}`}
                className="group focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
              >
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="mt-4 mb-3">
                  <h3 className="text-base font-semibold text-text">
                    {product.name}
                  </h3>
                  <p className="text-sm text-accent font-bold mt-1">
                    ৳{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
