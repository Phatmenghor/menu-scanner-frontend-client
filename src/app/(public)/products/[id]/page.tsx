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
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
  ZoomIn,
  X,
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
  const { dispatch: favoriteDispatch, items: favoriteItems, loaded: favLoaded } = useFavoriteState();
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false);

  // ── Favorite sync: prefer Redux store when loaded, else API field ──────
  const isFavoritedFromStore = favLoaded && product
    ? favoriteItems.some((item) => item.id === product.id)
    : product?.isFavorited ?? false;
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => {
    setIsFavorited(isFavoritedFromStore);
  }, [isFavoritedFromStore]);

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

  // Build deduped image list
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
        return [{ id: "main", imageUrl: mainUrl }, ...extras];
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
      setSelectedSize(
        product.hasSizes && product.sizes?.length ? product.sizes[0] : null
      );
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    dispatch(
      fetchPublicProducts({ pageNo: 1, pageSize: 6, categoryId: product.categoryId || undefined, status: "ACTIVE" })
    )
      .unwrap()
      .then((res) => {
        setSimilarProducts(
          (res.content || []).filter((p: any) => p.id !== productId).slice(0, 4)
        );
      })
      .catch(() => {});
  }, [product, productId, dispatch]);

  const selectImage = (url: string, index: number) => {
    setSelectedImage(url);
    setCurrentImageIndex(index);
    setImageLoaded(false);
  };

  const prevImage = () => {
    const idx = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    selectImage(allImages[idx].imageUrl, idx);
  };

  const nextImage = () => {
    const idx = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
    selectImage(allImages[idx].imageUrl, idx);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxImageLoaded(false);
    setLightboxOpen(true);
  };

  const prevLightbox = () => {
    const idx = lightboxIndex === 0 ? allImages.length - 1 : lightboxIndex - 1;
    setLightboxIndex(idx);
    setLightboxImageLoaded(false);
  };

  const nextLightbox = () => {
    const idx = lightboxIndex === allImages.length - 1 ? 0 : lightboxIndex + 1;
    setLightboxIndex(idx);
    setLightboxImageLoaded(false);
  };

  const getDisplayPrice = () => selectedSize?.finalPrice ?? product?.displayPrice ?? 0;
  const getOriginalPrice = () => {
    if (selectedSize?.hasPromotion) return selectedSize.price;
    if (product?.hasPromotion && product.displayOriginPrice) return product.displayOriginPrice;
    return null;
  };
  const hasDiscount = selectedSize ? selectedSize.hasPromotion : product?.hasPromotion;
  const discountPercent = (() => {
    const orig = getOriginalPrice();
    if (!orig) return 0;
    return Math.round(((orig - getDisplayPrice()) / orig) * 100);
  })();

  // Cart handler — inline, no modal
  const handleQuantityChange = useCallback(
    (sizeId: string | null, newQty: number) => {
      if (!product) return;
      if (!isAuthenticated) { setShowLoginModal(true); return; }

      const key = cartItemKey(product.id, sizeId);
      const sz = product.sizes?.find((s) => s.id === sizeId) ?? null;
      const price = sz?.finalPrice ?? product.displayPrice ?? 0;
      const origPrice =
        (sz?.hasPromotion ? sz.price : product.displayOriginPrice) ?? price;
      const isDiscounted = sz ? sz.hasPromotion : product.hasPromotion;
      const sizeName = sz?.name ?? null;
      const currentQty = getCartQuantityForSize(sizeId);

      if (currentQty === 0 && newQty > 0) {
        cartDispatch(
          addLocalCartItem({
            productId: product.id,
            productSizeId: sizeId,
            quantity: newQty,
            productName: product.name,
            productImageUrl: product.mainImageUrl,
            sizeName,
            finalPrice: price,
            currentPrice: origPrice,
            hasPromotion: isDiscounted ?? false,
          })
        );
      } else {
        cartDispatch(
          updateLocalCartItem({ productId: product.id, productSizeId: sizeId, quantity: newQty })
        );
      }
      debouncedUpdate(key, product.id, sizeId, newQty);
    },
    [product, isAuthenticated, cartDispatch, getCartQuantityForSize, debouncedUpdate]
  );

  const handleToggleFavorite = async () => {
    if (!product) return;
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    setIsFavorited((prev) => !prev);
    setIsTogglingFavorite(true);
    try {
      await favoriteDispatch(toggleFavorite({ productId: product.id })).unwrap();
    } catch (err: any) {
      setIsFavorited((prev) => !prev);
      showToast.error(err?.message || "Failed to update favorites");
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">

        {/* Back */}
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-5 -ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </CustomButton>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-16">

          {/* ──── LEFT: Image Gallery ──── */}
          <div className="space-y-3">

            {/* Main image */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-zoom-in group shadow-sm"
              onClick={() => openLightbox(currentImageIndex)}
            >
              {!imageLoaded && <Skeleton className="absolute inset-0 rounded-2xl" />}
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
                <Badge
                  variant="destructive"
                  className="absolute top-3 left-3 text-sm font-bold px-3 py-1.5 shadow"
                >
                  -{discountPercent}%
                </Badge>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 bg-background/75 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <ZoomIn className="h-4 w-4 text-foreground/70" />
              </div>

              {/* Prev / Next */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => selectImage(img.imageUrl, i)}
                    className={cn(
                      "relative flex-shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-150",
                      i === currentImageIndex
                        ? "ring-2 ring-primary ring-offset-2 shadow-sm"
                        : "opacity-55 hover:opacity-100 hover:ring-2 hover:ring-primary/40 hover:ring-offset-1"
                    )}
                  >
                    <Image src={img.imageUrl} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ──── RIGHT: Product Info ──── */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.categoryName && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Tag className="h-3 w-3" />{product.categoryName}
                </Badge>
              )}
              {product.brandName && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Store className="h-3 w-3" />{product.brandName}
                </Badge>
              )}
              <Badge
                className={cn(
                  "text-xs",
                  product.status === "OUT_OF_STOCK"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                {product.status === "OUT_OF_STOCK" ? "Out of Stock" : "In Stock"}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-primary leading-none">
                {formatCurrency(getDisplayPrice())}
              </span>
              {getOriginalPrice() && (
                <>
                  <span className="text-lg text-muted-foreground line-through leading-none mb-0.5">
                    {formatCurrency(getOriginalPrice()!)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full mb-0.5">
                    Save {formatCurrency(getOriginalPrice()! - getDisplayPrice())}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Sizes (inline – no modal) */}
            {product.hasSizes && product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Choose Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const sizeQty = getCartQuantityForSize(size.id);
                    const isActive = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "relative border-2 rounded-xl px-4 py-2.5 text-left min-w-[76px] transition-all",
                          isActive
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/40"
                        )}
                      >
                        <div className="font-semibold text-sm">{size.name}</div>
                        <div className="text-primary font-bold text-sm">
                          {formatCurrency(size.finalPrice)}
                        </div>
                        {size.hasPromotion && (
                          <div className="text-[10px] text-muted-foreground line-through">
                            {formatCurrency(size.price)}
                          </div>
                        )}
                        {sizeQty > 0 && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1">
                            {sizeQty}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Per-size qty controls */}
                {selectedSize && (
                  <div className="mt-3">
                    <SizeQtyRow
                      qty={getCartQuantityForSize(selectedSize.id)}
                      disabled={product.status === "OUT_OF_STOCK"}
                      price={selectedSize.finalPrice}
                      onDecrease={() => handleQuantityChange(selectedSize!.id, getCartQuantityForSize(selectedSize!.id) - 1)}
                      onIncrease={() => handleQuantityChange(selectedSize!.id, getCartQuantityForSize(selectedSize!.id) + 1)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Cart actions (non-sized) ── */}
            {!product.hasSizes && (
              <div>
                {currentCartQuantity === 0 ? (
                  <CustomButton
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
                    disabled={product.status === "OUT_OF_STOCK"}
                    onClick={() => handleQuantityChange(null, 1)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </CustomButton>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      className="h-11 w-11 shrink-0 rounded-xl border-2 border-border hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 dark:hover:bg-rose-950/30 flex items-center justify-center transition-all"
                      onClick={() => handleQuantityChange(null, currentCartQuantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-14 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {currentCartQuantity}
                    </div>
                    <button
                      className="h-11 w-11 shrink-0 rounded-xl border-2 border-border hover:bg-primary hover:border-primary hover:text-white flex items-center justify-center transition-all"
                      onClick={() => handleQuantityChange(null, currentCartQuantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 min-w-0">
                      <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">In Cart — {formatCurrency(getDisplayPrice() * currentCartQuantity)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist + Share */}
            <div className="grid grid-cols-2 gap-3">
              <CustomButton
                size="lg"
                variant="outline"
                className={cn(
                  "h-11 rounded-xl gap-2 transition-all font-medium",
                  isFavorited
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400"
                    : ""
                )}
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />}
                {isFavorited ? "Saved" : "Wishlist"}
              </CustomButton>
              <CustomButton
                size="lg"
                variant="outline"
                className="h-11 rounded-xl gap-2 font-medium"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
                Share
              </CustomButton>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t text-muted-foreground">
              <div className="flex items-center gap-1.5 text-sm">
                <Eye className="h-4 w-4" />
                <span>{product.viewCount.toLocaleString()}</span>
                <span className="text-xs">views</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Heart className="h-4 w-4" />
                <span>{product.favoriteCount.toLocaleString()}</span>
                <span className="text-xs">saves</span>
              </div>
              <div className="ml-auto text-xs font-mono text-muted-foreground/70">
                SKU: {product.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

          </div>
        </div>

        {/* ── You May Also Like ── */}
        {similarProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold">You May Also Like</h2>
              <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {similarProducts.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Image Lightbox ── */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl w-full p-0 bg-black/95 border-0 [&>button]:hidden">
          <div className="relative flex flex-col h-full">

            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Counter */}
            {allImages.length > 1 && (
              <div className="absolute top-3 left-3 z-10 bg-white/10 text-white text-xs px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Main image */}
            <div className="relative w-full aspect-square sm:aspect-[4/3]">
              {!lightboxImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              <Image
                src={allImages[lightboxIndex]?.imageUrl || appImages.NoImage}
                alt={product.name}
                fill
                className={cn("object-contain transition-opacity duration-200", lightboxImageLoaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setLightboxImageLoaded(true)}
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevLightbox}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextLightbox}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 p-3 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => { setLightboxIndex(i); setLightboxImageLoaded(false); }}
                    className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all",
                      i === lightboxIndex
                        ? "ring-2 ring-white"
                        : "opacity-40 hover:opacity-80"
                    )}
                  >
                    <Image src={img.imageUrl} alt={`${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}

// ── Helper: size qty row ───────────────────────────────────────────────────
function SizeQtyRow({
  qty,
  price,
  disabled,
  onDecrease,
  onIncrease,
}: {
  qty: number;
  price: number;
  disabled: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  if (qty === 0) {
    return (
      <CustomButton
        size="default"
        className="w-full h-11 gap-2 rounded-xl font-semibold"
        disabled={disabled}
        onClick={onIncrease}
      >
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </CustomButton>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="h-10 w-10 shrink-0 rounded-xl border-2 border-border hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 dark:hover:bg-rose-950/30 flex items-center justify-center transition-all"
        onClick={onDecrease}
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="w-12 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
        {qty}
      </div>
      <button
        className="h-10 w-10 shrink-0 rounded-xl border-2 border-border hover:bg-primary hover:border-primary hover:text-white flex items-center justify-center transition-all"
        onClick={onIncrease}
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="flex-1 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 min-w-0">
        <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">In Cart — {formatCurrency(price * qty)}</span>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Skeleton className="h-9 w-20 mb-5 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="space-y-5 pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-4/5 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
