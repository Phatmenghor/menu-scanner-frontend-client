"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/shared/card/product-card";

// Mock data - replace with actual API call
const mockAllProducts = [
  {
    id: "11",
    name: "Laptop Stand Aluminum Adjustable",
    mainImageUrl: "https://placehold.co/400x400/607D8B/white?text=Product+11",
    displayPrice: 45.99,
    displayOriginPrice: 45.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "12",
    name: "External SSD 1TB Portable Drive",
    mainImageUrl: "https://placehold.co/400x400/795548/white?text=Product+12",
    displayPrice: 119.99,
    displayOriginPrice: 149.99,
    hasPromotion: true,
    displayPromotionValue: 20,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "13",
    name: "Webcam HD 1080p with Microphone",
    mainImageUrl: "https://placehold.co/400x400/9E9E9E/white?text=Product+13",
    displayPrice: 59.99,
    displayOriginPrice: 59.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "14",
    name: "LED Desk Lamp with USB Charging",
    mainImageUrl: "https://placehold.co/400x400/FFEB3B/333?text=Product+14",
    displayPrice: 34.99,
    displayOriginPrice: 34.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "15",
    name: "Monitor 27 inch 4K IPS Display",
    mainImageUrl: "https://placehold.co/400x400/03A9F4/white?text=Product+15",
    displayPrice: 329.99,
    displayOriginPrice: 429.99,
    hasPromotion: true,
    displayPromotionValue: 23,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "16",
    name: "Wireless Charger Fast Charging Pad",
    mainImageUrl: "https://placehold.co/400x400/8BC34A/white?text=Product+16",
    displayPrice: 24.99,
    displayOriginPrice: 24.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "17",
    name: "Phone Case Protective Shockproof",
    mainImageUrl: "https://placehold.co/400x400/FFC107/333?text=Product+17",
    displayPrice: 14.99,
    displayOriginPrice: 14.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "18",
    name: "Screen Protector Tempered Glass",
    mainImageUrl: "https://placehold.co/400x400/FF5722/white?text=Product+18",
    displayPrice: 9.99,
    displayOriginPrice: 9.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "19",
    name: "Cable Organizer Set of 5",
    mainImageUrl: "https://placehold.co/400x400/9C27B0/white?text=Product+19",
    displayPrice: 12.99,
    displayOriginPrice: 12.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "20",
    name: "Tablet 10 inch Android Latest",
    mainImageUrl: "https://placehold.co/400x400/E91E63/white?text=Product+20",
    displayPrice: 199.99,
    displayOriginPrice: 249.99,
    hasPromotion: true,
    displayPromotionValue: 50,
    displayPromotionType: "FIXED_AMOUNT",
    status: "ACTIVE",
  },
  {
    id: "21",
    name: "Power Bank 20000mAh Portable",
    mainImageUrl: "https://placehold.co/400x400/4CAF50/white?text=Product+21",
    displayPrice: 39.99,
    displayOriginPrice: 39.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
  {
    id: "22",
    name: "USB Flash Drive 128GB High Speed",
    mainImageUrl: "https://placehold.co/400x400/2196F3/white?text=Product+22",
    displayPrice: 22.99,
    displayOriginPrice: 22.99,
    hasPromotion: false,
    status: "ACTIVE",
  },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "popular", label: "Most Popular" },
];

export function ProductSection() {
  const [products, setProducts] = useState<typeof mockAllProducts>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts(mockAllProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 12);
  };

  const displayedProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                All Products
              </h2>
              <p className="text-sm text-muted-foreground">
                Discover our complete collection
              </p>
            </div>
          </div>

          {/* Sort Dropdown */}
          <Link href="/promotions">
            <Button variant="ghost" className="group">
              View All
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {displayedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <Button
              size="lg"
              variant="outline"
              onClick={handleLoadMore}
              className="group"
            >
              Load More Products
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* View All CTA */}
        {!hasMore && (
          <div className="mt-8 text-center">
            <Link href="/products">
              <Button size="lg" className="group">
                View All Products
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
