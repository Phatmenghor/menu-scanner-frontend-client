"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ListChecks,
  FilterX,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";

const PRODUCT_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    if (!categoriesLoaded) fetchCategories({ pageSize: 100, status: "ACTIVE" });
  }, [categoriesLoaded, fetchCategories]);

  useEffect(() => {
    if (!brandsLoaded) fetchBrands({ pageSize: 100, status: "ACTIVE" });
  }, [brandsLoaded, fetchBrands]);

  // Sync from URL
  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setSelectedBrand(searchParams.get("brandId") || "");
    setSelectedStatuses(
      searchParams.get("status")?.split(",").filter(Boolean) || []
    );
    setHasPromotion(searchParams.get("hasPromotion") === "true");
    setSortBy(searchParams.get("sortBy") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, basePath]
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      pushParams(params);
    },
    [searchParams, pushParams]
  );

  const toggleStatus = useCallback(
    (status: string) => {
      const current = searchParams.get("status")?.split(",").filter(Boolean) || [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      const params = new URLSearchParams(searchParams.toString());
      if (next.length > 0) params.set("status", next.join(","));
      else params.delete("status");
      pushParams(params);
    },
    [searchParams, pushParams]
  );

  const applyPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    pushParams(params);
  }, [searchParams, pushParams, minPrice, maxPrice]);

  const clearPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    setMinPrice("");
    setMaxPrice("");
    pushParams(params);
  }, [searchParams, pushParams]);

  const clearAllFilters = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    router.push(basePath);
  }, [router, basePath]);

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const selectedBrandName = brands.find((b) => b.id === selectedBrand)?.name;

  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const hasPriceFilter = !!(urlMinPrice || urlMaxPrice);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    selectedStatuses.length +
    (!lockedPromotion && hasPromotion ? 1 : 0) +
    (hasPriceFilter ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilter("categoryId", "")}
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
              onClick={() => updateFilter("brandId", "")}
            >
              <Tag className="h-3 w-3" />
              {selectedBrandName}
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {selectedStatuses.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => toggleStatus(s)}
            >
              <ListChecks className="h-3 w-3" />
              {PRODUCT_STATUSES.find((p) => p.value === s)?.label ?? s}
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          ))}
          {!lockedPromotion && hasPromotion && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilter("hasPromotion", "")}
            >
              <Flame className="h-3 w-3" />
              Promotion
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {hasPriceFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={clearPrice}
            >
              <DollarSign className="h-3 w-3" />
              {urlMinPrice && urlMaxPrice
                ? `${urlMinPrice} – ${urlMaxPrice}`
                : urlMinPrice
                ? `Min ${urlMinPrice}`
                : `Max ${urlMaxPrice}`}
              <X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
        </div>
      )}

      {activeFiltersCount > 0 && <Separator />}

      {/* Promotion - top, hidden when locked */}
      {!lockedPromotion && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <label className="text-sm font-semibold">Promotion</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={!hasPromotion ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={() => updateFilter("hasPromotion", "")}
              >
                {!hasPromotion && <Check className="h-3 w-3 mr-1.5" />}
                All
              </Button>
              <Button
                variant={hasPromotion ? "default" : "outline"}
                size="sm"
                className={cn(
                  "w-full gap-1.5",
                  hasPromotion && "bg-orange-500 hover:bg-orange-600 border-orange-500"
                )}
                onClick={() => updateFilter("hasPromotion", hasPromotion ? "" : "true")}
              >
                {hasPromotion && <Check className="h-3 w-3" />}
                <Flame className="h-3 w-3" />
                On Sale
              </Button>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Category - Combobox */}
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
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__all__"
                    onSelect={() => {
                      updateFilter("categoryId", "");
                      setCategoryOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", !selectedCategory ? "opacity-100" : "opacity-0")}
                    />
                    All Categories
                  </CommandItem>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      onSelect={() => {
                        updateFilter("categoryId", cat.id === selectedCategory ? "" : cat.id);
                        setCategoryOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedCategory === cat.id ? "opacity-100" : "opacity-0")}
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

      {/* Brand - Combobox */}
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
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search brand..." />
              <CommandList>
                <CommandEmpty>No brands found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__all__"
                    onSelect={() => {
                      updateFilter("brandId", "");
                      setBrandOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", !selectedBrand ? "opacity-100" : "opacity-0")}
                    />
                    All Brands
                  </CommandItem>
                  {brands.map((brand) => (
                    <CommandItem
                      key={brand.id}
                      value={brand.name}
                      onSelect={() => {
                        updateFilter("brandId", brand.id === selectedBrand ? "" : brand.id);
                        setBrandOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedBrand === brand.id ? "opacity-100" : "opacity-0")}
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

      {/* Status - Multi-select checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10">
            <ListChecks className="h-3.5 w-3.5 text-green-600" />
          </div>
          <label className="text-sm font-semibold">Status</label>
          {selectedStatuses.length > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold ml-auto"
            >
              {selectedStatuses.length}
            </Badge>
          )}
        </div>
        <div className="space-y-2.5">
          {PRODUCT_STATUSES.map((status) => (
            <label
              key={status.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                id={`status-${status.value}`}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={() => toggleStatus(status.value)}
              />
              <span className="text-sm group-hover:text-primary transition-colors select-none">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-500/10">
            <DollarSign className="h-3.5 w-3.5 text-yellow-600" />
          </div>
          <label className="text-sm font-semibold">Price Range</label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-sm"
          />
          <span className="text-muted-foreground text-sm flex-shrink-0">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={applyPrice}
            disabled={!minPrice && !maxPrice}
          >
            Apply
          </Button>
          {hasPriceFilter && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearPrice}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Sort By - bottom, Select */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
          </div>
          <label className="text-sm font-semibold">Sort By</label>
        </div>
        <Select
          value={sortBy || "default"}
          onValueChange={(value) =>
            updateFilter("sortBy", value === "default" ? "" : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
              <span className="font-semibold text-foreground">
                {totalResults.toLocaleString()}
              </span>{" "}
              result{totalResults !== 1 ? "s" : ""} found
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
                <Button variant="default" size="sm" className="h-9 gap-2">
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
                    <span className="font-semibold text-foreground">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    result{totalResults !== 1 ? "s" : ""} found
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
