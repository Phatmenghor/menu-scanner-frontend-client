"use client";
import Image from "next/image";
import { Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { getAllProductService } from "@/services/dashboard/content-management/product/product.service";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { AllProduct } from "@/models/content-manangement/product/product.response";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (productId: string) => void;
}

export function SearchDialog({
  isOpen,
  onClose,
  onProductClick,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

    if (isOpen) {
      searchProducts();
    }
  }, [debouncedSearchQuery, user?.businessId, isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search submission - navigate to search results page
      console.log("Searching for:", searchQuery);
      onClose();
    }
  };

  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
    onClose();
    setSearchQuery("");
  };

  const handleDialogClose = () => {
    onClose();
    setSearchQuery("");
    setSearchResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-gray-800 text-lg focus:outline-none bg-transparent"
              autoFocus
            />
            <Button
              type="submit"
              className="bg-primary-pink hover:bg-primary-pink/90 text-white px-6 py-4 rounded-full m-1 transition-colors duration-200"
            >
              Search
            </Button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
                <p className="text-gray-500">Searching products...</p>
              </div>
            </div>
          ) : searchQuery.trim() && searchResults?.content?.length ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Search Results ({searchResults.content.length})
              </h3>
              <ul className="space-y-4">
                {searchResults.content.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="flex items-center gap-4 bg-white p-3 rounded-lg hover:shadow-md hover:border-primary-pink cursor-pointer transition-all"
                  >
                    {product.mainImageUrl && product.mainImageUrl.length > 0 ? (
                      <Image
                        src={product.mainImageUrl}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-primary-pink font-semibold text-sm">
                        ${product.price}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchQuery.trim() && !isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Start searching
                </h3>
                <p className="text-gray-500">
                  Type in the search box to find products
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
