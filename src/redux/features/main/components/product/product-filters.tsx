"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  X,
  SlidersHorizontal,
  Tag,
  Package,
  Check,
  ChevronsUpDown,
  Flame,
  ArrowUpDown,
  CircleDot,
  FilterX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";

interface ProductFiltersProps {
  totalResults: number;
  basePath?: string;
  lockedPromotion?: boolean;
}

export function ProductFilters({
  totalResults,
  basePath = "/products",
  lockedPromotion = false,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { categories, loaded: categoriesLoaded, fetchCategories } = usePublicCategoriesState();
  const { brands, loaded: brandsLoaded, fetchBrands } = usePublicBrandsState();

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("");

  // Fetch categories and brands from public endpoints
  useEffect(() => {
    if (!categoriesLoaded) {
      fetchCategories({ pageSize: 100, status: "ACTIVE" });
    }
  }, [categoriesLoaded, fetchCategories]);

  useEffect(() => {
    if (!brandsLoaded) {
      fetchBrands({ pageSize: 100, status: "ACTIVE" });
    }
  }, [brandsLoaded, fetchBrands]);

  // Sync from URL
  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setSelectedBrand(searchParams.get("brandId") || "");
    setSelectedStatus(searchParams.get("status") || "");
    setHasPromotion(searchParams.get("hasPromotion") === "true");
    setSortBy(searchParams.get("sortBy") || "");
  }, [searchParams]);

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${basePath}?${params.toString()}`);
    },
    [searchParams, router, basePath]
  );

  const clearAllFilters = useCallback(() => {
    router.push(basePath);
  }, [router, basePath]);

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const selectedBrandName = brands.find((b) => b.id === selectedBrand)?.name;

  const activeFiltersCount = [
    selectedCategory,
    selectedBrand,
    selectedStatus,
    !lockedPromotion && hasPromotion,
  ].filter(Boolean).length;

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ];

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilters("categoryId", "")}
            >
              <Package className="h-3 w-3" />
              {selectedCategoryName}
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {selectedBrand && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilters("brandId", "")}
            >
              <Tag className="h-3 w-3" />
              {selectedBrandName}
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {selectedStatus && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilters("status", "")}
            >
              <CircleDot className="h-3 w-3" />
              {selectedStatus === "ACTIVE" ? "In Stock" : "Out of Stock"}
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {!lockedPromotion && hasPromotion && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilters("hasPromotion", "")}
            >
              <Flame className="h-3 w-3" />
              On Sale
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
        </div>
      )}

      {activeFiltersCount > 0 && <Separator />}

      {/* Sort By */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
          </div>
          <label className="text-sm font-semibold">Sort By</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sortOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={sortBy === opt.value ? "default" : "outline"}
              size="sm"
              className="w-full text-xs justify-start"
              onClick={() =>
                updateFilters("sortBy", sortBy === opt.value ? "" : opt.value)
              }
            >
              {sortBy === opt.value && <Check className="h-3 w-3 mr-1.5" />}
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Category Filter - Combobox */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
            <Package className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <label className="text-sm font-semibold">Category</label>
        </div>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className="w-full justify-between font-normal"
            >
              <span className="truncate text-sm">
                {selectedCategoryName || "All Categories"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      updateFilters("categoryId", "");
                      setCategoryOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedCategory ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Categories
                  </CommandItem>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      onSelect={() => {
                        updateFilters("categoryId", cat.id === selectedCategory ? "" : cat.id);
                        setCategoryOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategory === cat.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cat.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      {/* Brand Filter - Combobox */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/10">
            <Tag className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <label className="text-sm font-semibold">Brand</label>
        </div>
        <Popover open={brandOpen} onOpenChange={setBrandOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={brandOpen}
              className="w-full justify-between font-normal"
            >
              <span className="truncate text-sm">
                {selectedBrandName || "All Brands"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search brand..." />
              <CommandList>
                <CommandEmpty>No brands found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      updateFilters("brandId", "");
                      setBrandOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedBrand ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Brands
                  </CommandItem>
                  {brands.map((brand) => (
                    <CommandItem
                      key={brand.id}
                      value={brand.name}
                      onSelect={() => {
                        updateFilters("brandId", brand.id === selectedBrand ? "" : brand.id);
                        setBrandOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedBrand === brand.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {brand.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10">
            <CircleDot className="h-3.5 w-3.5 text-green-500" />
          </div>
          <label className="text-sm font-semibold">Availability</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedStatus === "ACTIVE" ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() =>
              updateFilters("status", selectedStatus === "ACTIVE" ? "" : "ACTIVE")
            }
          >
            {selectedStatus === "ACTIVE" && <Check className="h-3 w-3 mr-1.5" />}
            In Stock
          </Button>
          <Button
            variant={selectedStatus === "OUT_OF_STOCK" ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={() =>
              updateFilters(
                "status",
                selectedStatus === "OUT_OF_STOCK" ? "" : "OUT_OF_STOCK"
              )
            }
          >
            {selectedStatus === "OUT_OF_STOCK" && <Check className="h-3 w-3 mr-1.5" />}
            Out of Stock
          </Button>
        </div>
      </div>

      {/* Special Offers - hidden on promotions page */}
      {!lockedPromotion && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <label className="text-sm font-semibold">Special Offers</label>
            </div>
            <Button
              variant={hasPromotion ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full justify-start gap-2",
                hasPromotion && "bg-orange-500 hover:bg-orange-600 border-orange-500"
              )}
              onClick={() =>
                updateFilters("hasPromotion", hasPromotion ? "" : "true")
              }
            >
              <Flame className="h-4 w-4" />
              {hasPromotion ? "Showing On-Sale Items" : "On Sale Only"}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-24 h-[calc(100vh-7rem)]">
        <div className="bg-card border rounded-xl shadow-sm h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base">Filters</h3>
              {activeFiltersCount > 0 && (
                <Badge className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                onClick={clearAllFilters}
              >
                <FilterX className="h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="px-5 py-3 border-b border-border/40 flex-shrink-0 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span>
              {" "}result{totalResults !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Scrollable content */}
          <ScrollArea className="flex-1">
            <div className="p-5">
              <FilterContent />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-3 bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`
                : "No filters applied"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-1.5 text-xs"
                onClick={clearAllFilters}
              >
                <FilterX className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="h-9 gap-2 relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-white text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96 p-0 flex flex-col">
                <SheetHeader className="px-5 py-4 border-b border-border/60 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2.5">
                      <SlidersHorizontal className="h-5 w-5 text-primary" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </SheetTitle>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-3.5 w-3.5" />
                        Clear all
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left mt-1">
                    <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span>
                    {" "}result{totalResults !== 1 ? "s" : ""} found
                  </p>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-5">
                    <FilterContent />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}
