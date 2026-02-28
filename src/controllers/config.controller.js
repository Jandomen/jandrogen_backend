const GlobalConfig = require("../models/GlobalConfig");

const getConfig = async (req, res) => {
    try {
        console.log("⚙️ ➡️ Obteniendo configuración global...");
        
        let config = await GlobalConfig.findOne();
        
        if (!config) {
            console.log("⚙️ 📝 No existe configuración, creando por defecto...");
            config = await GlobalConfig.create({});
            console.log("✅ Configuración por defecto creada");
        }
        
        console.log("✅ Configuración obtenida");
        res.json(config);
    } catch (error) {
        console.error("🔥 Error obteniendo configuración:", error.message);
        res.status(500).json({ message: "Error obteniendo configuración" });
    }
};

const updateConfig = async (req, res) => {
    try {
        const { paymentMethods } = req.body;
        
        console.log("⚙️ 🔄 Actualizando configuración...");
        console.log("   💳 Métodos de pago:", paymentMethods);

        let config = await GlobalConfig.findOne();
        
        if (!config) {
            console.log("⚙️ 📝 Creando nueva configuración...");
            config = new GlobalConfig();
        }

        if (paymentMethods) {
            config.paymentMethods = paymentMethods;
            console.log("   ✅ Métodos de pago actualizados");
        }

        await config.save();
        
        console.log("✅ Configuración actualizada exitosamente");
        res.json(config);
    } catch (error) {
        console.error("🔥 Error actualizando configuración:", error.message);
        res.status(500).json({ message: "Error actualizando configuración" });
    }
};

module.exports = {
    getConfig,
    updateConfig
};
