const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ['pem', 'storage', 'components', 'infra', 'mobile', 'other'],
      default: 'other',
      index: true
    },

    priceUSD: {
      type: Number,
      required: true,
      min: 0
    },

    stock: {
      type: Number,
      default: 0
    },

    manufactureDays: {
      type: Number,
      required: true
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: v => v.length >= 1,
        message: "Mínimo 1 imagen requerida"
      }
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
