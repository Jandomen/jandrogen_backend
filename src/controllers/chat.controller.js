const { Conversation, Message } = require("../models/Chat");
const { getIO } = require("../config/socket");

const createConversation = async (req, res) => {
    try {
        const { client, subject, message } = req.body;

        console.log("💬 ➕ Nueva conversación iniciada");
        console.log("   👤 Cliente:", client.name);
        console.log("   📧 Email:", client.email);
        console.log("   📝 Asunto:", subject);
        console.log("   💬 Mensaje:", message.substring(0, 50) + "...");

        const conversation = await Conversation.create({
            client,
            subject,
            lastMessage: message,
            lastMessageAt: new Date()
        });

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: "client",
            content: message
        });

        console.log("✅ Conversación creada:", conversation._id);
        console.log("✅ Mensaje guardado");

        console.log("   📡 Notificando al admin en tiempo real...");
        try {
            const io = getIO();
            io.to("admin-room").emit("new-message", {
                conversationId: conversation._id,
                client: conversation.client,
                subject: conversation.subject,
                lastMessage: message,
                createdAt: conversation.createdAt
            });
            console.log("   ✅ Notificación enviada");
        } catch (socketError) {
            console.warn("   ⚠️ Error en socket:", socketError.message);
        }

        res.status(201).json({
            success: true,
            conversationId: conversation._id,
            message: "Conversación iniciada correctamente"
        });
    } catch (error) {
        console.error("🔥 Error creando conversación:", error.message);
        res.status(500).json({ success: false, message: "Error al iniciar conversación" });
    }
};

const getClientConversations = async (req, res) => {
    try {
        const { email } = req.params;
        
        console.log("💬 ➡️ Obteniendo conversaciones del cliente:", email);

        const conversations = await Conversation.find({ "client.email": email })
            .sort({ lastMessageAt: -1 });

        console.log("✅ Conversaciones encontradas:", conversations.length);

        const conversationsWithMessages = await Promise.all(
            conversations.map(async (conv) => {
                const messages = await Message.find({ conversationId: conv._id })
                    .sort({ createdAt: 1 })
                    .limit(50);
                return { ...conv.toObject(), messages };
            })
        );

        res.status(200).json(conversationsWithMessages);
    } catch (error) {
        console.error("🔥 Error obteniendo conversaciones:", error.message);
        res.status(500).json({ message: "Error al obtener conversaciones" });
    }
};

const getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log("💬 ➡️ Obteniendo conversación:", id);

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            console.warn("⚠️ Conversación no encontrada:", id);
            return res.status(404).json({ message: "Conversación no encontrada" });
        }

        const messages = await Message.find({ conversationId: id })
            .sort({ createdAt: 1 });

        console.log("✅ Conversación encontrada, mensajes:", messages.length);

        res.status(200).json({ ...conversation.toObject(), messages });
    } catch (error) {
        console.error("🔥 Error obteniendo conversación:", error.message);
        res.status(500).json({ message: "Error al obtener conversación" });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, sender } = req.body;

        console.log("💬 ➡️ Enviando mensaje");
        console.log("   🆔 Conversación:", conversationId);
        console.log("   👤 Remitente:", sender);
        console.log("   💬 Contenido:", content.substring(0, 30) + "...");

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            console.warn("⚠️ Conversación no encontrada:", conversationId);
            return res.status(404).json({ message: "Conversación no encontrada" });
        }

        const newMessage = await Message.create({
            conversationId,
            sender,
            content
        });

        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        if (sender === "admin") {
            conversation.status = "pending";
        }
        await conversation.save();

        console.log("✅ Mensaje guardado:", newMessage._id);

        console.log("   📡 Notificando en tiempo real...");
        try {
            const io = getIO();

            if (sender === "admin") {
                io.to("admin-room").emit("message-sent", {
                    conversationId,
                    message: newMessage
                });
            } else {
                io.to("admin-room").emit("new-message", {
                    conversationId,
                    client: conversation.client,
                    lastMessage: content,
                    createdAt: new Date()
                });
            }

            console.log("   ✅ Notificación enviada");
        } catch (socketError) {
            console.warn("   ⚠️ Error en socket:", socketError.message);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("🔥 Error enviando mensaje:", error.message);
        res.status(500).json({ message: "Error al enviar mensaje" });
    }
};

const getAllConversations = async (req, res) => {
    try {
        console.log("💬 ➡️ Obteniendo todas las conversaciones (admin)");

        const conversations = await Conversation.find()
            .sort({ lastMessageAt: -1 });

        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (conv) => {
                const lastMsg = await Message.findOne({ conversationId: conv._id })
                    .sort({ createdAt: -1 });
                return {
                    ...conv.toObject(),
                    lastMessagePreview: lastMsg?.content?.substring(0, 50) || ""
                };
            })
        );

        console.log("✅ Total conversaciones:", conversations.length);
        res.status(200).json(conversationsWithLastMessage);
    } catch (error) {
        console.error("🔥 Error obteniendo conversaciones:", error.message);
        res.status(500).json({ message: "Error al obtener conversaciones" });
    }
};

const updateConversationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log("💬 🔄 Actualizando estado de conversación:", id);
        console.log("   📊 Nuevo estado:", status);

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!conversation) {
            console.warn("⚠️ Conversación no encontrada:", id);
            return res.status(404).json({ message: "Conversación no encontrada" });
        }

        console.log("✅ Estado actualizado:", conversation.status);
        res.status(200).json(conversation);
    } catch (error) {
        console.error("🔥 Error actualizando estado:", error.message);
        res.status(500).json({ message: "Error al actualizar estado" });
    }
};

module.exports = {
    createConversation,
    getClientConversations,
    getConversation,
    sendMessage,
    getAllConversations,
    updateConversationStatus
};
