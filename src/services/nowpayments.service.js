const axios = require("axios");

const api = axios.create({
  baseURL: "https://api.nowpayments.io/v1",
  headers: {
    "x-api-key": process.env.NOWPAYMENTS_API_KEY,
    "Content-Type": "application/json"
  }
});

const createPayment = async ({ amount, orderId }) => {
  try {
    console.log("₿ 💰 Creando pago con NowPayments");
    console.log("   🆔 Order ID:", orderId);
    console.log("   💵 Cantidad:", amount, "USD");
    console.log("   🪙 Moneda de pago: BTC");

    const { data } = await api.post("/payment", {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: "btc",
      order_id: orderId,
      order_description: "JANDROGEN · Generador de Hidrógeno",
      ipn_callback_url: `${process.env.BACKEND_URL}/api/webhooks/nowpayments`
    });

    console.log("✅ Pago creado en NowPayments");
    console.log("   🆔 Payment ID:", data.payment_id);
    console.log("   📍 Dirección de pago:", data.pay_address);
    console.log("   💰 Cantidad a pagar:", data.pay_amount, data.pay_currency);

    return data;
  } catch (error) {
    console.error("🔥 Error creando pago BTC:", error.response?.data || error.message);
    throw error;
  }
};

const getPaymentStatus = async (paymentId) => {
  try {
    console.log("₿ 🔍 Consultando estado del pago:", paymentId);
    const { data } = await api.get(`/payment/${paymentId}`);
    console.log("   📊 Estado:", data.payment_status);
    return data;
  } catch (error) {
    console.error("🔥 Error consultando estado:", error.message);
    throw error;
  }
};

module.exports = {
  createPayment,
  getPaymentStatus
};
