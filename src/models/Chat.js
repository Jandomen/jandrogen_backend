const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {
        type: String,
        enum: ["client", "admin"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
    client: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String }
    },
    subject: {
        type: String,
        default: "Consulta General"
    },
    status: {
        type: String,
        enum: ["open", "pending", "closed"],
        default: "open"
    },
    lastMessage: {
        type: String
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Conversation, Message };
