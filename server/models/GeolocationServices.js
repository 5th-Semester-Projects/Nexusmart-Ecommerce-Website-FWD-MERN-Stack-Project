import mongoose from 'mongoose';

const geolocationServicesSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Store Locations
  stores: [{
    storeId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['flagship', 'retail', 'warehouse', 'pickup-point', 'pop-up'],
      default: 'retail'
    },

    // Location Details
    location: {
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        fullAddress: String
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true,
          index: '2dsphere'
        }
      },
      placeId: String,
      googleMapsUrl: String
    },

    // Contact Information
    contact: {
      phone: String,
      email: String,
      website: String,
      manager: {
        name: String,
        phone: String,
        email: String
      }
    },

    // Operating Hours
    hours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean }
    },
    specialHours: [{
      date: Date,
      open: String,
      close: String,
      closed: Boolean,
      reason: String
    }],

    // Services & Amenities
    services: [{
      type: String,
      enum: ['pickup', 'returns', 'exchanges', 'gift-wrap', 'personal-shopping', 'alterations', 'installation']
    }],
    amenities: [{
      type: String,
      enum: ['parking', 'wheelchair-accessible', 'wifi', 'restrooms', 'fitting-rooms', 'cafe']
    }],

    // Inventory
    inventory: {
      tracksInventory: {
        type: Boolean,
        default: true
      },
      products: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        lastUpdated: Date,
        location: String,
        reservedQuantity: {
          type: Number,
          default: 0
        }
      }],
      lowStockThreshold: {
        type: Number,
        default: 5
      }
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'temporarily-closed', 'permanently-closed', 'coming-soon'],
      default: 'active'
    },

    // Images & Media
    images: [String],
    videos: [String],

    // Additional Info
    description: String,
    features: [String],

    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Geofencing
  geofences: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['store-vicinity', 'delivery-zone', 'promotional-area', 'restricted-zone'],
      required: true
    },

    // Geofence Area
    area: {
      type: {
        type: String,
        enum: ['Point', 'Polygon', 'Circle'],
        required: true
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      radius: Number
    },

    // Triggers
    triggers: {
      onEnter: {
        enabled: {
          type: Boolean,
          default: true
        },
        actions: [{
          type: String,
          enum: ['send-notification', 'show-offer', 'update-shipping', 'suggest-pickup']
        }],
        notification: {
          title: String,
          message: String,
          deepLink: String
        },
        offer: {
          type: {
            type: String,
            enum: ['discount', 'free-shipping', 'gift', 'points']
          },
          value: Number,
          code: String
        }
      },
      onExit: {
        enabled: {
          type: Boolean,
          default: false
        },
        actions: [String],
        notification: {
          title: String,
          message: String
        }
      }
    },

    // Schedule
    schedule: {
      enabled: {
        type: Boolean,
        default: false
      },
      startDate: Date,
      endDate: Date,
      daysOfWeek: [Number],
      timeRanges: [{
        start: String,
        end: String
      }]
    },

    // Analytics
    analytics: {
      totalEntries: {
        type: Number,
        default: 0
      },
      totalExits: {
        type: Number,
        default: 0
      },
      uniqueVisitors: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      },
      conversionRate: {
        type: Number,
        default: 0
      }
    },

    active: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Location-Based Shipping
  locationBasedShipping: {
    enabled: {
      type: Boolean,
      default: true
    },
    zones: [{
      name: String,
      description: String,
      area: {
        type: {
          type: String,
          enum: ['Polygon', 'Circle'],
          required: true
        },
        coordinates: mongoose.Schema.Types.Mixed,
        radius: Number
      },
      shippingOptions: [{
        method: String,
        cost: Number,
        estimatedDays: {
          min: Number,
          max: Number
        },
        freeShippingThreshold: Number
      }],
      restrictions: {
        minOrderValue: Number,
        maxOrderValue: Number,
        excludedProducts: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        }]
      }
    }]
  },

  // User Location History
  userLocationHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    locations: [{
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number]
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      accuracy: Number,
      activity: {
        type: String,
        enum: ['browsing', 'near-store', 'in-store', 'checkout']
      }
    }],
    preferredStore: {
      type: mongoose.Schema.Types.ObjectId
    },
    lastVisitedStore: {
      store: mongoose.Schema.Types.ObjectId,
      visitedAt: Date
    }
  }],

  // Local Inventory Search
  localInventory: {
    enabled: {
      type: Boolean,
      default: true
    },
    searchRadius: {
      type: Number,
      default: 50
    },
    searchRadiusUnit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    },
    showOutOfStock: {
      type: Boolean,
      default: false
    },
    reservationEnabled: {
      type: Boolean,
      default: true
    },
    reservationDuration: {
      type: Number,
      default: 24
    }
  },

  // Analytics
  analytics: {
    storeVisits: [{
      store: mongoose.Schema.Types.ObjectId,
      date: Date,
      visitors: Number,
      purchases: Number,
      revenue: Number
    }],
    popularStores: [{
      store: mongoose.Schema.Types.ObjectId,
      visits: Number,
      conversions: Number
    }],
    geofencePerformance: [{
      geofence: mongoose.Schema.Types.ObjectId,
      entries: Number,
      conversions: Number,
      revenue: Number
    }]
  },

  // Settings
  settings: {
    enableStoreLocator: {
      type: Boolean,
      default: true
    },
    enableGeofencing: {
      type: Boolean,
      default: true
    },
    enableLocationBasedOffers: {
      type: Boolean,
      default: true
    },
    requestLocationPermission: {
      type: Boolean,
      default: true
    },
    fallbackStore: mongoose.Schema.Types.ObjectId,
    mapProvider: {
      type: String,
      enum: ['google-maps', 'mapbox', 'openstreetmap'],
      default: 'google-maps'
    },
    apiKeys: {
      googleMaps: String,
      mapbox: String
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

// Indexes
geolocationServicesSchema.index({ 'stores.location.coordinates': '2dsphere' });

// Methods
geolocationServicesSchema.methods.findNearbyStores = function (longitude, latitude, maxDistance = 50000) {
  return this.stores.filter(store => {
    if (store.status !== 'active') return false;

    const [storeLng, storeLat] = store.location.coordinates.coordinates;
    const distance = this.calculateDistance(latitude, longitude, storeLat, storeLng);

    return distance <= maxDistance;
  }).sort((a, b) => {
    const [aLng, aLat] = a.location.coordinates.coordinates;
    const [bLng, bLat] = b.location.coordinates.coordinates;

    const distA = this.calculateDistance(latitude, longitude, aLat, aLng);
    const distB = this.calculateDistance(latitude, longitude, bLat, bLng);

    return distA - distB;
  });
};

geolocationServicesSchema.methods.calculateDistance = function (lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

geolocationServicesSchema.methods.checkProductAvailability = function (productId, longitude, latitude, radius) {
  const nearbyStores = this.findNearbyStores(longitude, latitude, radius);

  return nearbyStores.map(store => {
    const inventoryItem = store.inventory.products.find(
      p => p.product.toString() === productId.toString()
    );

    return {
      store: {
        id: store.storeId,
        name: store.name,
        address: store.location.address.fullAddress,
        distance: this.calculateDistance(
          latitude,
          longitude,
          store.location.coordinates.coordinates[1],
          store.location.coordinates.coordinates[0]
        )
      },
      available: inventoryItem ? inventoryItem.quantity > 0 : false,
      quantity: inventoryItem ? inventoryItem.quantity : 0
    };
  });
};

geolocationServicesSchema.methods.triggerGeofence = function (userId, longitude, latitude, action) {
  const activeGeofences = this.geofences.filter(g => g.active);

  const triggeredGeofences = activeGeofences.filter(geofence => {
    return this.isPointInGeofence(longitude, latitude, geofence);
  });

  triggeredGeofences.forEach(geofence => {
    if (action === 'enter' && geofence.triggers.onEnter.enabled) {
      geofence.analytics.totalEntries++;
    } else if (action === 'exit' && geofence.triggers.onExit.enabled) {
      geofence.analytics.totalExits++;
    }
  });

  return this.save();
};

geolocationServicesSchema.methods.isPointInGeofence = function (longitude, latitude, geofence) {
  if (geofence.area.type === 'Circle') {
    const [centerLng, centerLat] = geofence.area.coordinates;
    const distance = this.calculateDistance(latitude, longitude, centerLat, centerLng);
    return distance <= geofence.area.radius;
  }

  return false;
};

// Statics
geolocationServicesSchema.statics.getBusinessStores = function (businessId) {
  return this.findOne({ business: businessId })
    .select('stores');
};

const GeolocationServices = mongoose.model('GeolocationServices', geolocationServicesSchema);

export default GeolocationServices;
