"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared/card/product-card";

// Mock data - replace with actual API call
const mockPromotionProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones with Noise Cancellation",
    mainImageUrl: "https://placehold.co/400x400/4472C4/white?text=Product+1",
    displayPrice: 79.99,
    displayOriginPrice: 129.99,
    hasPromotion: true,
    displayPromotionValue: 38,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Smart Watch Series 5 - Fitness Tracker",
    mainImageUrl: "https://placehold.co/400x400/E91E63/white?text=Product+2",
    displayPrice: 199.99,
    displayOriginPrice: 299.99,
    hasPromotion: true,
    displayPromotionValue: 33,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "4K Ultra HD Smart TV 55 inch",
    mainImageUrl: "https://placehold.co/400x400/4CAF50/white?text=Product+3",
    displayPrice: 449.99,
    displayOriginPrice: 699.99,
    hasPromotion: true,
    displayPromotionValue: 250,
    displayPromotionType: "FIXED_AMOUNT",
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Gaming Laptop Pro 16GB RAM",
    mainImageUrl: "https://placehold.co/400x400/FF9800/white?text=Product+4",
    displayPrice: 899.99,
    displayOriginPrice: 1299.99,
    hasPromotion: true,
    displayPromotionValue: 30,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "5",
    name: "Professional Camera DSLR Kit",
    mainImageUrl: "https://placehold.co/400x400/9C27B0/white?text=Product+5",
    displayPrice: 749.99,
    displayOriginPrice: 999.99,
    hasPromotion: true,
    displayPromotionValue: 25,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "6",
    name: "Bluetooth Speaker Waterproof",
    mainImageUrl: "https://placehold.co/400x400/00BCD4/white?text=Product+6",
    displayPrice: 39.99,
    displayOriginPrice: 59.99,
    hasPromotion: true,
    displayPromotionValue: 33,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "7",
    name: "Mechanical Gaming Keyboard RGB",
    mainImageUrl: "https://placehold.co/400x400/F44336/white?text=Product+7",
    displayPrice: 89.99,
    displayOriginPrice: 129.99,
    hasPromotion: true,
    displayPromotionValue: 40,
    displayPromotionType: "FIXED_AMOUNT",
    status: "ACTIVE",
  },
  {
    id: "8",
    name: "Wireless Mouse Ergonomic Design",
    mainImageUrl: "https://placehold.co/400x400/3F51B5/white?text=Product+8",
    displayPrice: 29.99,
    displayOriginPrice: 49.99,
    hasPromotion: true,
    displayPromotionValue: 40,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "9",
    name: "USB-C Hub 7-in-1 Multiport Adapter",
    mainImageUrl: "https://placehold.co/400x400/009688/white?text=Product+9",
    displayPrice: 34.99,
    displayOriginPrice: 54.99,
    hasPromotion: true,
    displayPromotionValue: 37,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
  {
    id: "10",
    name: "Phone Stand Adjustable Aluminum",
    mainImageUrl: "https://placehold.co/400x400/FF5722/white?text=Product+10",
    displayPrice: 19.99,
    displayOriginPrice: 29.99,
    hasPromotion: true,
    displayPromotionValue: 33,
    displayPromotionType: "PERCENTAGE",
    status: "ACTIVE",
  },
];

export function PromotionSection() {
  const [products, setProducts] = useState<typeof mockPromotionProducts>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchPromotionProducts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts(mockPromotionProducts);
      setIsLoading(false);
    };

    fetchPromotionProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Flame className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Hot Deals
              </h2>
              <p className="text-sm text-muted-foreground">
                Limited time offers - Don't miss out!
              </p>
            </div>
          </div>

          <Link href="/promotions">
            <Button variant="ghost" className="group">
              View All
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link href="/promotions">
            <Button size="lg" className="group">
              Explore All Promotions
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
