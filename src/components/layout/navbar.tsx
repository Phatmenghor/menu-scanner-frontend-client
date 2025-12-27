"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, ShoppingCart, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { LanguageSwitcher } from "@/components/shared/swapper/language-switcher";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Promotion", href: "/promotions" },
  { name: "Category", href: "/categories" },
  { name: "Brand", href: "/brands" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Mock data - replace with actual data from your store/redux
  const cartItemCount = 3;
  const isLoggedIn = false; // Change based on auth state
  const userProfile = {
    fullName: "John Doe",
    email: "john@example.com",
    profileImageUrl: "",
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main Navbar */}
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Left Section: Logo & Navigation */}
          <div className="flex items-center gap-8">
            {/* Mobile Menu Button */}
            <Button
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
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
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
                  Menu Scanner
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  E-Commerce
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Center Section: Search Bar (Hidden on mobile) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full bg-muted/50 border-border hover:border-primary/50 focus:border-primary focus:ring-primary/20 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Section: Cart, Profile, Language */}
          <div className="flex items-center gap-2">
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 hover:text-primary transition-colors"
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
            </Button>

            {/* User Profile / Login */}
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
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      // Handle logout
                      router.push("/login");
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/login")}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-full bg-muted/50 border-border focus:border-primary focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
                >
                  {link.name}
                </Button>
              </Link>
            ))}

            {/* Mobile Language Switcher */}
            <div className="pt-2 sm:hidden">
              <LanguageSwitcher className="w-full" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
