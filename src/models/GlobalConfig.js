const mongoose = require("mongoose");

const globalConfigSchema = new mongoose.Schema(
    {
        paymentMethods: {
            crypto: {
                enabled: { type: Boolean, default: true },
                label: { type: String, default: "Bitcoin (BTC)" }
            },
            card: {
                enabled: { type: Boolean, default: true },
                label: { type: String, default: "Tarjeta (Stripe/MercadoPago)" }
            }
        },
        siteName: { type: String, default: "JANDROGEN" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("GlobalConfig", globalConfigSchema);
