const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        priceAtPurchase: {
          type: Number,
          required: true
        }
      }
    ],

    totalUSD: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["crypto", "mercadopago", "stripe"],
      default: "crypto"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    paymentId: {
      type: String
    },

    transactionHash: {
      type: String
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "preparing_shipment",
        "shipped",
        "delivered"
      ],
      default: "pending"
    },

    technicalSpecs: {
      voltage: { type: String, default: "110V" },
      gasCapacity: { type: String, default: "2LPM" },
      applicationType: { type: String, default: "Doméstico" }
    },

    estimatedDeliveryDate: {
      type: Date
    },

    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String }
    },

    shippingAddress: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);
