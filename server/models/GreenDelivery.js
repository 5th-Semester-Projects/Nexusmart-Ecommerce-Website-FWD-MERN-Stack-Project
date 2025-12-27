import mongoose from 'mongoose';

const greenDeliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carbonFootprint: {
    packaging: {
      material: String,
      weight: Number,
      co2Emissions: Number,
      recyclable: Boolean,
      recycledContent: Number
    },
    transportation: {
      distance: Number,
      mode: {
        type: String,
        enum: ['electric_vehicle', 'hybrid', 'bicycle', 'walking', 'standard', 'air']
      },
      co2Emissions: Number,
      fuelUsed: Number
    },
    warehouse: {
      co2Emissions: Number,
      energyUsed: Number,
      renewableEnergy: Boolean
    },
    total: {
      co2Emissions: Number,
      co2Offset: Number,
      netEmissions: Number
    }
  },
  offsetOptions: [{
    provider: String,
    project: {
      name: String,
      type: {
        type: String,
        enum: ['reforestation', 'renewable_energy', 'ocean_cleanup', 'carbon_capture']
      },
      location: String,
      description: String,
      certification: String
    },
    cost: Number,
    co2Offset: Number,
    selected: {
      type: Boolean,
      default: false
    }
  }],
  offsetPurchased: {
    purchased: {
      type: Boolean,
      default: false
    },
    provider: String,
    project: String,
    amount: Number,
    co2Offset: Number,
    certificate: {
      url: String,
      number: String,
      issuedAt: Date
    },
    transactionId: String
  },
  ecoScore: {
    overall: Number,
    packaging: Number,
    shipping: Number,
    production: Number,
    grade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D', 'F']
    }
  },
  greenOptions: {
    consolidatedShipping: Boolean,
    minimalPackaging: Boolean,
    reusablePackaging: Boolean,
    localSourced: Boolean,
    carbonNeutral: Boolean
  },
  impact: {
    treesPlanted: Number,
    plasticSaved: Number,
    waterSaved: Number,
    equivalentTo: {
      milesDriven: Number,
      phonesCharged: Number,
      treeSeedlings: Number
    }
  }
}, {
  timestamps: true
, suppressReservedKeysWarning: true });

greenDeliverySchema.index({ order: 1 });
greenDeliverySchema.index({ user: 1 });
greenDeliverySchema.index({ 'carbonFootprint.total.netEmissions': 1 });

export default mongoose.model('GreenDelivery', greenDeliverySchema);
