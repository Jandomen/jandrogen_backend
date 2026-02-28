const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const createMercadoPagoPreference = async ({
  orderId,
  title,
  price,
  quantity
}) => {
  try {
    console.log("💳 ➡️ Creando preferencia de pago con MercadoPago");
    console.log("   🆔 Order ID:", orderId);
    console.log("   📦 Producto:", title);
    console.log("   💵 Precio:", price, "USD");
    console.log("   🔢 Cantidad:", quantity);

    const preference = {
      items: [
        {
          title,
          unit_price: price,
          quantity,
          currency_id: "USD"
        }
      ],
      external_reference: orderId,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/success`,
        failure: `${process.env.FRONTEND_URL}/failure`
      },
      auto_return: "approved"
    };

    console.log("   📡 Enviando solicitud a MercadoPago...");
    const response = await mercadopago.preferences.create(preference);

    console.log("✅ Preferencia de MercadoPago creada");
    console.log("   🆔 Preference ID:", response.body.id);
    console.log("   🔗 URL de pago:", response.body.init_point);

    return response.body;
  } catch (error) {
    console.error("🔥 Error creando preferencia MercadoPago:", error.message);
    throw error;
  }
};

module.exports = { createMercadoPagoPreference };
