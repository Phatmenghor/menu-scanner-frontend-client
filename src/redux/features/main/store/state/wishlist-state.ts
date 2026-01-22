import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";

export const useWishlistState = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlist = useSelector((state: RootState) => state.wishlist);

  return {
    dispatch,
    items: wishlist.items,
    totalItems: wishlist.totalItems,
    loading: wishlist.loading,
    error: wishlist.error,
    loaded: wishlist.loaded,
  };
};
