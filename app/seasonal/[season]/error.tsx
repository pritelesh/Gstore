"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="neu-flat p-10 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-text mb-3">
            Something went wrong
          </h2>
          <p className="text-sm text-text/60 mb-6">
            We couldn&apos;t load this seasonal collection. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
