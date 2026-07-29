"use client";

import CircleIconButton from "@/components/CircleIconButton";
import { CloudRain, Sun, Snowflake, ShoppingCart } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="w-full md:w-2/5 xl:w-[35%] flex flex-col justify-center">
            <h1 className="text-6xl sm:text-7xl font-extrabold leading-tight text-text">
              KGstore
            </h1>
            <p className="mt-4 text-base text-text/60 max-w-md">
              Your one-stop seasonal shop.
            </p>
          </div>

          <div className="w-full md:flex-1">
            <div className="flex gap-6 md:gap-14 justify-center items-stretch">
              <div className="flex flex-col items-center justify-end">
                <span className="text-[#FAFFC4] font-bold text-lg mb-4">
                  Shop Now
                </span>
                <CircleIconButton
                  href="/products"
                  Icon={ShoppingCart}
                  ariaLabel="Go to Products"
                />
              </div>

              <div className="flex flex-col items-center justify-end">
                <h2 className="text-xl font-bold text-text mb-4">
                  Seasonal Products
                </h2>
                <div className="flex gap-6 md:gap-14">
                  <CircleIconButton
                    href="/seasonal/rainy"
                    Icon={CloudRain}
                    ariaLabel="Rainy"
                  />
                  <CircleIconButton
                    href="/seasonal/summer"
                    Icon={Sun}
                    ariaLabel="Summer"
                  />
                  <CircleIconButton
                    href="/seasonal/winter"
                    Icon={Snowflake}
                    ariaLabel="Winter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
