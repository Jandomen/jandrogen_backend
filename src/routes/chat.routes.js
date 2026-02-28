const express = require("express");
const router = express.Router();
const {
    createConversation,
    getClientConversations,
    getConversation,
    sendMessage,
    getAllConversations,
    updateConversationStatus
} = require("../controllers/chat.controller");
const { jwtAuth } = require("../middlewares/jwtAuth");

router.post("/", createConversation);
router.get("/client/:email", getClientConversations);
router.get("/all", jwtAuth, getAllConversations);
router.get("/:id", getConversation);
router.post("/message", sendMessage);
router.put("/:id/status", jwtAuth, updateConversationStatus);

module.exports = router;
