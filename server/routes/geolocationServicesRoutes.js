import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getGeolocationConfig,
  createGeolocationConfig,
  addStore,
  updateStore,
  findNearbyStores,
  checkProductAvailability,
  createGeofence,
  updateGeofence,
  triggerGeofenceEvent,
  getStoreInventory,
  updateStoreInventory,
  getLocationBasedShipping,
  getGeolocationAnalytics
} from '../controllers/geolocationServicesController.js';

const router = express.Router();

router.route('/geolocation/config')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getGeolocationConfig)
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createGeolocationConfig);

router.route('/geolocation/stores/add')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), addStore);

router.route('/geolocation/stores/:storeId')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateStore);

router.route('/geolocation/stores/nearby').get(findNearbyStores);

router.route('/geolocation/availability').get(checkProductAvailability);

router.route('/geolocation/geofence/create')
  .post(isAuthenticatedUser, authorizeRoles('seller', 'admin'), createGeofence);

router.route('/geolocation/geofence/:geofenceId')
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateGeofence);

router.route('/geolocation/geofence/trigger').post(isAuthenticatedUser, triggerGeofenceEvent);

router.route('/geolocation/inventory/:storeId')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getStoreInventory)
  .put(isAuthenticatedUser, authorizeRoles('seller', 'admin'), updateStoreInventory);

router.route('/geolocation/shipping').get(getLocationBasedShipping);

router.route('/geolocation/analytics')
  .get(isAuthenticatedUser, authorizeRoles('seller', 'admin'), getGeolocationAnalytics);

export default router;
