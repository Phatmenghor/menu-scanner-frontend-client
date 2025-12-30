"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

  const cartItemCount = 3;
  const isLoggedIn = false;
  const userProfile = {
    fullName: "John Doe",
    email: "john@example.com",
    profileImageUrl: "",
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
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
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products..."
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

        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products..."
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
