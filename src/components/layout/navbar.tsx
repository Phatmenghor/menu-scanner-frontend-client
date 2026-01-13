"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, Search, ShoppingCart, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomButton } from "../shared/button/custom-button";
import { useDebounce } from "@/utils/debounce/debounce";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Promotions", href: "/products?hasPromotion=true" },
  { name: "Categories", href: "/categories" },
  { name: "Brands", href: "/brands" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const cartItemCount = 3;
  const isLoggedIn = false;
  const userProfile = {
    fullName: "John Doe",
    email: "john@example.com",
    profileImageUrl: "",
  };

  // Initialize search query from URL on mount
  useEffect(() => {
    const urlSearchQuery = searchParams.get("q");
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Handle debounced search - update URL when debounced value changes
  useEffect(() => {
    // Get current search params
    const params = new URLSearchParams(searchParams.toString());

    // Determine which route to search on
    let searchRoute = pathname;

    // If on home page, redirect to products
    if (pathname === "/") {
      searchRoute = "/products";
    }

    if (debouncedSearchQuery.trim()) {
      // Add or update search query
      params.set("q", debouncedSearchQuery.trim());
      router.push(`${searchRoute}?${params.toString()}`);
    } else {
      // Remove search query if empty
      params.delete("q");
      const newUrl = params.toString()
        ? `${searchRoute}?${params.toString()}`
        : searchRoute;
      router.push(newUrl);
    }
  }, [debouncedSearchQuery]); // Only trigger when debounced value changes

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: Force immediate search on Enter key
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      let searchRoute = pathname === "/" ? "/products" : pathname;
      params.set("q", searchQuery.trim());
      router.push(`${searchRoute}?${params.toString()}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <CustomButton
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </CustomButton>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Image
                  src="/assets/favicon.ico"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="rounded object-contain"
                  priority
                />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-foreground font-bold text-sm leading-tight">
                  E-Commerce
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  Shop Online
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary hover:bg-primary/10"
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={
                  pathname === "/products"
                    ? "Search products..."
                    : pathname === "/categories"
                    ? "Search categories..."
                    : pathname === "/brands"
                    ? "Search brands..."
                    : "Search..."
                }
                className="pl-10 w-full bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <CustomButton
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </CustomButton>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <CustomAvatar
                      imageUrl={userProfile.profileImageUrl}
                      name={userProfile.fullName}
                      size="md"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <CustomAvatar
                      imageUrl={userProfile.profileImageUrl}
                      name={userProfile.fullName}
                      size="md"
                    />
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {userProfile.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wishlist")}>
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => router.push("/login")}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <CustomButton
                variant="ghost"
                size="icon"
                onClick={() => router.push("/login")}
              >
                <User className="h-5 w-5" />
              </CustomButton>
            )}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="md:hidden pb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={
                pathname === "/products"
                  ? "Search products..."
                  : pathname === "/categories"
                  ? "Search categories..."
                  : pathname === "/brands"
                  ? "Search brands..."
                  : "Search..."
              }
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
