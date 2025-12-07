import express from 'express';
import {
  getUserWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  shareWishlist,
  checkPriceDrops,
  enablePriceAlerts,
  moveToCart,
  getPublicWishlists,
  getWishlistAnalytics,
  updateItemNotes,
  updateItemPriority
} from '../controllers/wishlistFavoritesController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

router.route('/wishlist')
  .get(isAuthenticatedUser, getUserWishlists)
  .post(isAuthenticatedUser, createWishlist);

router.route('/wishlist/public')
  .get(getPublicWishlists);

router.route('/wishlist/:id')
  .get(isAuthenticatedUser, getWishlistById)
  .put(isAuthenticatedUser, updateWishlist)
  .delete(isAuthenticatedUser, deleteWishlist);

router.route('/wishlist/:id/items')
  .post(isAuthenticatedUser, addItemToWishlist);

router.route('/wishlist/:id/items/:productId')
  .delete(isAuthenticatedUser, removeItemFromWishlist);

router.route('/wishlist/:id/items/:productId/notes')
  .put(isAuthenticatedUser, updateItemNotes);

router.route('/wishlist/:id/items/:productId/priority')
  .put(isAuthenticatedUser, updateItemPriority);

router.route('/wishlist/:id/share')
  .post(isAuthenticatedUser, shareWishlist);

router.route('/wishlist/:id/price-drops')
  .get(isAuthenticatedUser, checkPriceDrops);

router.route('/wishlist/:id/price-alerts')
  .put(isAuthenticatedUser, enablePriceAlerts);

router.route('/wishlist/:id/move-to-cart')
  .post(isAuthenticatedUser, moveToCart);

router.route('/wishlist/:id/analytics')
  .get(isAuthenticatedUser, getWishlistAnalytics);

export default router;
