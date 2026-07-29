export default function Loading() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 h-8 w-48 rounded bg-text/5 animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="neu-flat p-5 animate-pulse space-y-4">
              <div className="h-10 rounded-xl bg-text/5" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-3/4 rounded bg-text/5" />
              ))}
            </div>
          </div>
          <div className="lg:w-3/4">
            <div className="mb-6 h-4 w-32 rounded bg-text/5 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="neu-flat p-4 animate-pulse">
                  <div className="w-full aspect-[4/3] rounded-xl bg-text/5" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-text/5" />
                  <div className="mt-2 h-4 w-1/3 rounded bg-text/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
