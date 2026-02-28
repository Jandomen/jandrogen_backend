const Inquiry = require("../models/Inquiry");
const { triggerN8nWebhook } = require("../services/webhook.service");

const sendInquiry = async (req, res) => {
    try {
        const { name, email, phone, message, interest } = req.body;

        console.log("📩 ➕ Nueva consulta técnica recibida");
        console.log("   👤 Nombre:", name);
        console.log("   📧 Email:", email);
        console.log("   📱 Teléfono:", phone || "No proporcionado");
        console.log("   🎯 Interés:", interest || "General");

        const newInquiry = new Inquiry({
            name,
            email,
            phone,
            message,
            interest
        });
        
        console.log("   💾 Guardando en base de datos...");
        await newInquiry.save();
        console.log("   ✅ Consulta guardada con ID:", newInquiry._id);

        console.log("   📡 Intentando enviar webhook a n8n...");
        try {
            await triggerN8nWebhook({
                event: 'TECHNICAL_INQUIRY',
                data: {
                    id: newInquiry._id,
                    name,
                    email,
                    phone,
                    message,
                    interest,
                    createdAt: newInquiry.createdAt
                }
            });
            console.log("   ✅ Webhook enviado exitosamente");
        } catch (webhookError) {
            console.warn("   ⚠️ Error en webhook (no crítico):", webhookError.message);
        }

        console.log("✅ Consulta enviada correctamente");
        res.status(200).json({
            success: true,
            message: "Consulta enviada correctamente",
            inquiryId: newInquiry._id
        });
    } catch (error) {
        console.error("🔥 Error enviando consulta:", error.message);
        res.status(500).json({
            success: false,
            message: "Error enviando consulta"
        });
    }
};

const getInquiries = async (req, res) => {
    try {
        console.log("📩 ➡️ Obteniendo todas las consultas...");
        
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        
        console.log("✅ Consultas encontradas:", inquiries.length);
        res.status(200).json(inquiries);
    } catch (error) {
        console.error("🔥 Error obteniendo consultas:", error.message);
        res.status(500).json({ message: "Error obteniendo consultas" });
    }
};

module.exports = {
    sendInquiry,
    getInquiries
};
