"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProductFiltersProps {
  categories?: Array<{ id: string; name: string }>;
  brands?: Array<{ id: string; name: string }>;
  totalResults: number;
}

export function ProductFilters({
  categories = [],
  brands = [],
  totalResults,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setSelectedBrand(searchParams.get("brandId") || "");
    setSelectedStatus(searchParams.get("status") || "");
    setHasPromotion(searchParams.get("hasPromotion") === "true");
    setSortBy(searchParams.get("sortBy") || "newest");
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedBrand,
    selectedStatus,
    hasPromotion,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => updateFilters("categoryId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Brand</label>
        <Select
          value={selectedBrand}
          onValueChange={(value) => updateFilters("brandId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Availability</label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => updateFilters("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="ACTIVE">In Stock</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promotion Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Special Offers</label>
        <Button
          variant={hasPromotion ? "default" : "outline"}
          className="w-full"
          onClick={() =>
            updateFilters("hasPromotion", hasPromotion ? "" : "true")
          }
        >
          {hasPromotion ? "✓ " : ""}On Sale Only
        </Button>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select
          value={sortBy}
          onValueChange={(value) => updateFilters("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-card border rounded-lg p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalResults} products found
          </p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
