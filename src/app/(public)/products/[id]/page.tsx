"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchPublicProductById,
  fetchPublicProducts,
} from "@/redux/features/main/store/thunks/public-product-thunks";
import { clearSelectedProduct } from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
import { toggleFavorite } from "@/redux/features/main/store/thunks/favorite-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { SizeSelectionModal } from "@/components/shared/modal/size-selection-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  Store,
  Tag,
  Eye,
  Bookmark,
} from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "@/hooks/use-scroll-restoration";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { dispatch, selectedProduct, loading, error } = usePublicProductState();
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: favoriteDispatch } = useFavoriteState();
  const { isAuthenticated } = useAuthState();

  const productId = params.id as string;
  const product = selectedProduct;
  const isLoading = loading.detail;

  useScrollToTop();

  const [similarProducts, setSimilarProducts] = useState<ProductDetailResponseModel[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Local favorite state — fixes the bug where product.isFavorited never updates
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => { setIsFavorited(product?.isFavorited ?? false); }, [product?.isFavorited]);

  const { debouncedUpdate } = useCartDebounce(cartDispatch);

  const getCartQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!product) return 0;
      const cartItem = cartItems.find(
        (item) => item.productId === product.id && item.productSizeId === sizeId
      );
      return cartItem?.quantity || 0;
    },
    [cartItems, product]
  );

  const currentCartQuantity = selectedSize
    ? getCartQuantityForSize(selectedSize.id)
    : product
    ? getCartQuantityForSize(null)
    : 0;

  // Total in cart across all sizes (for sized products)
  const totalSizesInCart = product?.hasSizes
    ? cartItems.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  // Build image list — deduplicate by sanitized URL so thumbnails are always distinct
  const allImages = product
    ? (() => {
        const mainUrl = sanitizeImageUrl(product.mainImageUrl, appImages.NoImage);
        const seen = new Set<string>([mainUrl]);
        const extras = (product.images || [])
          .map((img) => ({ ...img, imageUrl: sanitizeImageUrl(img.imageUrl, appImages.NoImage) }))
          .filter((img) => {
            if (seen.has(img.imageUrl)) return false;
            seen.add(img.imageUrl);
            return true;
          });
        return [{ id: "main", imageUrl: mainUrl, displayOrder: 0 }, ...extras];
      })()
    : [];

  useEffect(() => {
    if (productId) {
      dispatch(clearSelectedProduct());
      dispatch(fetchPublicProductById(productId));
    }
  }, [productId, dispatch]);

  useEffect(() => {
    if (product) {
      setSelectedImage(sanitizeImageUrl(product.mainImageUrl, appImages.NoImage));
      setCurrentImageIndex(0);
      setImageLoaded(false);
      if (product.hasSizes && product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const load = async () => {
        try {
          const res = await dispatch(
            fetchPublicProducts({ pageNo: 1, pageSize: 5, categoryId: product.categoryId || undefined, status: "ACTIVE" })
          ).unwrap();
          const similar = res.content?.filter((p: any) => p.id !== productId) || [];
          setSimilarProducts(similar.slice(0, 4));
        } catch { /* silently ignore */ }
      };
      load();
    }
  }, [product, productId, dispatch]);

  const handlePrevImage = () => {
    const idx = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(idx);
    setSelectedImage(allImages[idx].imageUrl);
    setImageLoaded(false);
  };

  const handleNextImage = () => {
    const idx = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(idx);
    setSelectedImage(allImages[idx].imageUrl);
    setImageLoaded(false);
  };

  const handleSelectImage = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setImageLoaded(false);
  };

  const getDisplayPrice = () => selectedSize?.finalPrice ?? product?.displayPrice ?? 0;

  const getOriginalPrice = () => {
    if (selectedSize?.hasPromotion) return selectedSize.price;
    if (product?.hasPromotion && product.displayOriginPrice) return product.displayOriginPrice;
    return null;
  };

  const hasDiscount = selectedSize ? selectedSize.hasPromotion : product?.hasPromotion;

  // Cart handler for non-sized products (card-like: optimistic + debounced)
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (!product) return;
      if (!isAuthenticated) { setShowLoginModal(true); return; }

      const sizeId = selectedSize?.id || null;
      const key = cartItemKey(product.id, sizeId);
      const currentQty = getCartQuantityForSize(sizeId);
      const price = selectedSize?.finalPrice || product.displayPrice || 0;
      const origPrice = (selectedSize?.hasPromotion ? selectedSize.price : product.displayOriginPrice) || price;
      const isDiscounted = selectedSize ? selectedSize.hasPromotion : product.hasActivePromotion;

      if (currentQty === 0 && newQuantity > 0) {
        cartDispatch(addLocalCartItem({
          productId: product.id,
          productSizeId: sizeId,
          quantity: newQuantity,
          productName: product.name,
          productImageUrl: product.mainImageUrl,
          sizeName: selectedSize?.name || null,
          finalPrice: price,
          currentPrice: origPrice,
          hasPromotion: isDiscounted,
        }));
      } else {
        cartDispatch(updateLocalCartItem({
          productId: product.id,
          productSizeId: sizeId,
          quantity: newQuantity,
        }));
      }

      debouncedUpdate(key, product.id, sizeId, newQuantity);
    },
    [product, selectedSize, isAuthenticated, cartDispatch, getCartQuantityForSize, debouncedUpdate]
  );

  const handleToggleFavorite = async () => {
    if (!product) return;
    if (!isAuthenticated) { setShowLoginModal(true); return; }

    setIsFavorited((prev) => !prev); // optimistic
    setIsTogglingFavorite(true);
    try {
      await favoriteDispatch(toggleFavorite({ productId: product.id })).unwrap();
    } catch (error: any) {
      setIsFavorited((prev) => !prev); // rollback
      showToast.error(error?.message || "Failed to update favorites");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name || "Product", url: window.location.href }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied to clipboard");
    }
  };

  if (isLoading || (!product && !error.detail)) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const discountPercent = getOriginalPrice()
    ? Math.round(((getOriginalPrice()! - getDisplayPrice()) / getOriginalPrice()!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">

        {/* Back button */}
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 -ml-1 hover:bg-accent gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </CustomButton>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 mb-12 sm:mb-20">

          {/* ── Left: Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border bg-muted/20 group shadow-sm">
              {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
              <Image
                src={selectedImage || appImages.NoImage}
                alt={product.name}
                fill
                className={cn("object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setImageLoaded(true)}
                priority
              />

              {/* Discount badge */}
              {hasDiscount && discountPercent > 0 && (
                <Badge variant="destructive" className="absolute top-3 left-3 text-sm font-bold px-3 py-1.5 shadow-lg">
                  -{discountPercent}%
                </Badge>
              )}

              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Counter pill */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails — only border, no check icon overlay */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img.imageUrl, index)}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all duration-150 cursor-pointer hover:scale-105",
                      currentImageIndex === index
                        ? "border-primary shadow-sm shadow-primary/30 scale-105"
                        : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image src={img.imageUrl} alt={`Image ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="space-y-5">

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {product.brandName && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Store className="h-3 w-3" />{product.brandName}
                  </Badge>
                )}
                {product.categoryName && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Tag className="h-3 w-3" />{product.categoryName}
                  </Badge>
                )}
                {product.status === "OUT_OF_STOCK" ? (
                  <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                ) : (
                  <Badge className="text-xs bg-green-500 hover:bg-green-600">In Stock</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="bg-muted/40 rounded-2xl p-4 border">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-primary">
                  {formatCurrency(getDisplayPrice())}
                </span>
                {getOriginalPrice() && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(getOriginalPrice()!)}
                  </span>
                )}
              </div>
              {hasDiscount && discountPercent > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                  You save {formatCurrency((getOriginalPrice() || 0) - getDisplayPrice())}
                </p>
              )}
            </div>

            {/* Sizes — informational; cart managed via size modal */}
            {product.hasSizes && product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2.5 text-sm text-muted-foreground uppercase tracking-wide">Choose Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const sizeCartQty = getCartQuantityForSize(size.id);
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "relative border-2 rounded-xl px-4 py-2.5 transition-all cursor-pointer text-left min-w-[80px]",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <div className="font-semibold text-sm">{size.name}</div>
                        <div className="text-primary font-bold text-base leading-tight">
                          {formatCurrency(size.finalPrice)}
                        </div>
                        {size.hasPromotion && (
                          <div className="text-xs text-muted-foreground line-through">{formatCurrency(size.price)}</div>
                        )}
                        {/* Cart quantity badge */}
                        {sizeCartQty > 0 && (
                          <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-bold px-1">
                            {sizeCartQty}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-1.5 text-sm text-muted-foreground uppercase tracking-wide">Description</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="space-y-3 pt-1">
              {product.hasSizes ? (
                /* Sized: show cart summary + open size modal */
                <>
                  {totalSizesInCart > 0 && (
                    <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                      <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium flex-1">
                        {totalSizesInCart} item{totalSizesInCart !== 1 ? "s" : ""} in cart
                      </span>
                    </div>
                  )}
                  <CustomButton
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
                    variant={totalSizesInCart > 0 ? "outline" : "default"}
                    disabled={product.status === "OUT_OF_STOCK"}
                    onClick={() => setShowSizeModal(true)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {totalSizesInCart > 0 ? "Manage Cart (Sizes)" : "Choose Size & Add to Cart"}
                  </CustomButton>
                </>
              ) : (
                /* Non-sized: card-like pattern — Add button → qty controls */
                currentCartQuantity === 0 ? (
                  <CustomButton
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
                    disabled={product.status === "OUT_OF_STOCK"}
                    onClick={() => handleQuantityChange(1)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </CustomButton>
                ) : (
                  <div className="flex items-center gap-2">
                    <CustomButton
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                      onClick={() => handleQuantityChange(currentCartQuantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </CustomButton>
                    <div className="w-12 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {currentCartQuantity}
                    </div>
                    <CustomButton
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all"
                      onClick={() => handleQuantityChange(currentCartQuantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </CustomButton>
                    <div className="flex-1 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center justify-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-medium px-2 min-w-0">
                      <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">In Cart — {formatCurrency(getDisplayPrice() * currentCartQuantity)}</span>
                    </div>
                  </div>
                )
              )}

              {/* Wishlist + Share row */}
              <div className="grid grid-cols-2 gap-3">
                <CustomButton
                  size="lg"
                  variant="outline"
                  className={cn(
                    "h-12 rounded-xl gap-2 transition-all",
                    isFavorited && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
                  )}
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                >
                  {isTogglingFavorite
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />}
                  {isFavorited ? "Saved" : "Wishlist"}
                </CustomButton>
                <CustomButton size="lg" variant="outline" className="h-12 rounded-xl gap-2" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                  Share
                </CustomButton>
              </div>
            </div>

            {/* Meta info */}
            <div className="border-t pt-4 grid grid-cols-3 gap-4 text-center">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-xs">Views</span>
                </div>
                <p className="text-sm font-semibold">{product.viewCount.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="text-xs">Favorites</span>
                </div>
                <p className="text-sm font-semibold">{product.favoriteCount.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Bookmark className="h-3.5 w-3.5" />
                  <span className="text-xs">SKU</span>
                </div>
                <p className="text-sm font-semibold font-mono">{product.id.slice(0, 6).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold">You May Also Like</h2>
              <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {similarProducts.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {similarProducts.map((similar) => (
                <ProductCard key={similar.id} product={similar} />
              ))}
            </div>
          </div>
        )}
      </div>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <SizeSelectionModal
        open={showSizeModal}
        onOpenChange={setShowSizeModal}
        product={product}
      />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Skeleton className="h-9 w-24 mb-6 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-16 h-16 rounded-xl flex-shrink-0" />)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
