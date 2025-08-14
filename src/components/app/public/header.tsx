"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  ShoppingBag,
  Tag,
  ChevronDown,
  Heart,
  ShoppingCart,
  User,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LanguageSwitcher from "@/components/shared/common/language-switcher";
import { ROUTES } from "@/constants/app-routed/routes";
import { useState, useEffect } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { getAllProductService } from "@/services/dashboard/content-management/product/product.service";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { AllProduct } from "@/models/content-manangement/product/product.response";
import { SearchDialog } from "./header/search-modal";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<AllProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const user = getUserInfo();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await getAllProductService({
            search: debouncedSearchQuery,
            pageNo: 1,
            businessId: user?.businessId,
            pageSize: 8, // Show more results in dialog
          });
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    };

    if (isSearchOpen) {
      searchProducts();
    }
  }, [debouncedSearchQuery, user?.businessId, isSearchOpen]);

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search submission - navigate to search results page
      console.log("Searching for:", searchQuery);
      setIsSearchOpen(false);
    }
  };

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page
    console.log("Navigate to product:", productId);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleDialogClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
  };

  return (
    <>
      <header className="bg-white text-primary shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <Image
              src="/abstract-licking-logo.png"
              alt="Lick Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-primary-pink hover:text-primary-pink/80"
              prefetch={false}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 text-gray-700 hover:text-primary-pink"
              prefetch={false}
            >
              <ShoppingBag className="w-5 h-5" />
              Products
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 text-gray-700 hover:text-primary-pink"
              prefetch={false}
            >
              <Tag className="w-5 h-5" />
              Promotions
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-gray-700 hover:text-primary-pink focus:outline-none">
                Lick family
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-primary">
                <DropdownMenuItem>Family Member 1</DropdownMenuItem>
                <DropdownMenuItem>Family Member 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700 hover:text-primary-pink"
            onClick={handleSearchIconClick}
          >
            <Search className="w-5 h-5" />
            <span className="sr-only">Search</span>
          </Button>

          <LanguageSwitcher variant="flag-only" />
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700 hover:text-primary-pink"
          >
            <Heart className="w-5 h-5" />
            <span className="sr-only">Wishlist</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700 hover:text-primary-pink"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="sr-only">Shopping Cart</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-gray-700 hover:text-primary-pink focus:outline-none">
              <User className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="text-primary">
              <DropdownMenuItem>
                <Link href={ROUTES.CUSTOMER.DASHBOARD}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Address</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={handleDialogClose}
        onProductClick={handleProductClick}
      />
    </>
  );
}
