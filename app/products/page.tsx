import { getProducts, getCategories, type PaginatedResult } from "@/lib/actions/products";
import ProductsContent from "./ProductsContent";

interface Props {
  searchParams: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const search = searchParams.search || "";
  const selectedCategories = searchParams.category
    ? searchParams.category.split(",").filter(Boolean)
    : [];
  const minPrice = searchParams.minPrice || "";
  const maxPrice = searchParams.maxPrice || "";
  const sort = searchParams.sort || "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);

  let productsResult: PaginatedResult = { products: [], total: 0, page: 1, totalPages: 0 };
  let categories: string[] = [];
  let fetchError = false;

  try {
    const [pr, cats] = await Promise.all([
      getProducts({
        search: search || undefined,
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sort !== "newest" ? sort : undefined,
        page,
        limit: 9,
      }),
      getCategories(),
    ]);
    productsResult = pr;
    categories = cats.filter((c) => c.type === "normal").map((c) => c.name);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    fetchError = true;
  }

  return (
    <ProductsContent
      initialProducts={productsResult.products}
      initialTotal={productsResult.total}
      initialTotalPages={productsResult.totalPages}
      initialCategories={categories}
      initialSearch={search}
      initialSelectedCategories={selectedCategories}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
      initialSort={sort}
      initialPage={page}
      fetchError={fetchError}
    />
  );
}
