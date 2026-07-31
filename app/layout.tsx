import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ServerHeader from "@/components/layout/ServerHeader";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
// DO NOT REMOVE: This import tells Tailwind to compile all @tailwind directives
// into real CSS. If this line is missing, NO Tailwind classes will work anywhere
// on the site — every page will render as unstyled HTML.
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KGStore",
  description: "Multi-vendor eCommerce Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <CartProvider>
          <ServerHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
