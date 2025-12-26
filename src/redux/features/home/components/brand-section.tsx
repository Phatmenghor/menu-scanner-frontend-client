"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock brand data - replace with actual API call
const mockBrands = [
  {
    id: "1",
    name: "Apple",
    description: "Premium electronics and technology",
    imageUrl: "https://placehold.co/200x200/000000/white?text=Apple",
    productCount: 45,
  },
  {
    id: "2",
    name: "Samsung",
    description: "Innovation in mobile and electronics",
    imageUrl: "https://placehold.co/200x200/1428A0/white?text=Samsung",
    productCount: 52,
  },
  {
    id: "3",
    name: "Sony",
    description: "Entertainment and technology leader",
    imageUrl: "https://placehold.co/200x200/000000/white?text=Sony",
    productCount: 38,
  },
  {
    id: "4",
    name: "LG",
    description: "Life's good with innovative products",
    imageUrl: "https://placehold.co/200x200/A50034/white?text=LG",
    productCount: 41,
  },
  {
    id: "5",
    name: "Dell",
    description: "Computers and technology solutions",
    imageUrl: "https://placehold.co/200x200/007DB8/white?text=Dell",
    productCount: 29,
  },
  {
    id: "6",
    name: "HP",
    description: "Computing and printing solutions",
    imageUrl: "https://placehold.co/200x200/0096D6/white?text=HP",
    productCount: 33,
  },
  {
    id: "7",
    name: "Lenovo",
    description: "Smart technology for all",
    imageUrl: "https://placehold.co/200x200/E2231A/white?text=Lenovo",
    productCount: 27,
  },
  {
    id: "8",
    name: "Asus",
    description: "Innovation and quality",
    imageUrl: "https://placehold.co/200x200/000000/white?text=Asus",
    productCount: 31,
  },
];

export function BrandSection() {
  const [brands, setBrands] = useState<typeof mockBrands>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchBrands = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBrands(mockBrands);
      setIsLoading(false);
    };

    fetchBrands();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Shop by Brand
              </h2>
              <p className="text-sm text-muted-foreground">
                Explore products from top brands
              </p>
            </div>
          </div>

          <Link href="/brands">
            <Button variant="ghost" className="group hidden md:flex">
              View All Brands
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Brands Grid - 4 columns x 2 rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <div className="group relative overflow-hidden rounded-lg bg-white border border-gray-200 aspect-[2/1] transition-all duration-300 hover:shadow-lg cursor-pointer">
                {/* Brand Image */}
                <div className="relative w-full h-full">
                  <Image
                    src={brand.imageUrl}
                    alt={brand.name}
                    fill
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Hover Overlay - Slides up from bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-4 flex flex-col justify-end">
                  <h3 className="font-semibold text-white text-sm md:text-base">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    {brand.productCount} Products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/brands">
            <Button className="group w-full sm:w-auto">
              View All Brands
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
