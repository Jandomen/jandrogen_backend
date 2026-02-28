const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        interest: {
            type: String,
            enum: ["Doméstico", "Industrial", "Vehicular"],
            default: "Doméstico",
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "contacted", "resolved"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
