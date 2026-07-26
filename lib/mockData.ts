export interface MockProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  storeName: string;
}

export const allProducts: MockProduct[] = [
  { id: "1", name: "Wireless Headphones", price: 2499, description: "Premium wireless headphones with noise cancellation.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Headphones", category: "Electronics", storeName: "TechWorld" },
  { id: "2", name: "Cotton T-Shirt", price: 899, description: "Soft breathable cotton t-shirt.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=T-Shirt", category: "Fashion", storeName: "StyleHub" },
  { id: "3", name: "LED Desk Lamp", price: 1299, description: "Adjustable LED desk lamp with touch control.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Desk+Lamp", category: "Home & Living", storeName: "HomeEssentials" },
  { id: "4", name: "Leather Wallet", price: 1499, description: "Genuine leather wallet with RFID protection.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Wallet", category: "Fashion", storeName: "LeatherCraft" },
  { id: "5", name: "Bluetooth Speaker", price: 1899, description: "Portable waterproof Bluetooth speaker.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Speaker", category: "Electronics", storeName: "TechWorld" },
  { id: "6", name: "Running Shoes", price: 3299, description: "Lightweight running shoes with responsive cushioning.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Shoes", category: "Sports", storeName: "ActiveGear" },
  { id: "r1", name: "Automatic Umbrella", price: 699, description: "Windproof automatic umbrella.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Umbrella", category: "Rainy", storeName: "RainyDays" },
  { id: "r2", name: "Raincoat", price: 1299, description: "Waterproof raincoat with hood.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Raincoat", category: "Rainy", storeName: "RainyDays" },
  { id: "r3", name: "Waterproof Backpack", price: 1899, description: "Durable waterproof backpack.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Backpack", category: "Rainy", storeName: "RainyDays" },
  { id: "r4", name: "Gumboots", price: 999, description: "Classic waterproof gumboots.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Gumboots", category: "Rainy", storeName: "RainyDays" },
  { id: "s1", name: "Summer Cotton T-Shirt", price: 599, description: "Lightweight summer cotton t-shirt.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Cotton+T-Shirt", category: "Summer", storeName: "SummerVibes" },
  { id: "s2", name: "Sunglasses", price: 899, description: "UV400 protection polarized sunglasses.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Sunglasses", category: "Summer", storeName: "SummerVibes" },
  { id: "s3", name: "Desk Fan", price: 1499, description: "Quiet oscillating desk fan.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Desk+Fan", category: "Summer", storeName: "CoolZone" },
  { id: "s4", name: "Cap", price: 399, description: "Adjustable cotton cap.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Cap", category: "Summer", storeName: "SummerVibes" },
  { id: "s5", name: "Water Bottle", price: 499, description: "Insulated stainless steel water bottle.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Water+Bottle", category: "Summer", storeName: "CoolZone" },
  { id: "s6", name: "Sandals", price: 799, description: "Comfortable summer sandals.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Sandals", category: "Summer", storeName: "SummerVibes" },
  { id: "w1", name: "Hoodie", price: 1799, description: "Warm fleece-lined hoodie.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Hoodie", category: "Winter", storeName: "WarmWear" },
  { id: "w2", name: "Wool Blanket", price: 2499, description: "Soft premium wool blanket.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Wool+Blanket", category: "Winter", storeName: "WarmWear" },
  { id: "w3", name: "Thermal Set", price: 1299, description: "Men's thermal underwear set.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Thermal+Set", category: "Winter", storeName: "WarmWear" },
  { id: "w4", name: "Winter Jacket", price: 2999, description: "Insulated winter jacket.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Winter+Jacket", category: "Winter", storeName: "WarmWear" },
  { id: "w5", name: "Gloves", price: 499, description: "Touchscreen-compatible thermal gloves.", image: "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Gloves", category: "Winter", storeName: "WarmWear" },
];

export const categories = [
  "Electronics", "Fashion", "Home & Living", "Sports",
  "Rainy", "Summer", "Winter",
];

export const ITEMS_PER_PAGE = 9;
