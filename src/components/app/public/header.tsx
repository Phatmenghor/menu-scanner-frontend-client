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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "@/components/shared/common/language-switcher";
import { ROUTES } from "@/constants/app-routed/routes";

export function Header() {
  return (
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
  );
}
