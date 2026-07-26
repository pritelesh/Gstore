import Hero from "@/components/sections/Hero";
import WhyShopWithUs from "@/components/sections/WhyShopWithUs";
import ProductGrid from "@/components/sections/ProductGrid";
import CreateStoreCTA from "@/components/sections/CreateStoreCTA";
import DeliverySection from "@/components/sections/DeliverySection";

export default function Home() {
  return (
    <>
      <Hero />
      <WhyShopWithUs />
      <ProductGrid />
      <CreateStoreCTA />
      <DeliverySection />
    </>
  );
}
