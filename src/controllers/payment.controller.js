const Order = require("../models/Order");
const { createPayment } = require("../services/nowpayments.service");
const { createStripeSession: stripeSession } = require("../services/stripe.service");

const createCryptoPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("💰 ➕ Creando pago con criptomonedas");
    console.log("   🆔 Order ID:", orderId);

    const order = await Order.findOne({ orderId });
    
    if (!order) {
      console.warn("⚠️ Orden no encontrada:", orderId);
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log("   ✅ Orden encontrada");
    console.log("   💵 Total: $", order.totalUSD.toLocaleString());
    console.log("   📊 Estado actual:", order.paymentStatus);

    if (order.paymentStatus === "paid") {
      console.warn("⚠️ La orden ya está pagada");
      return res.status(400).json({ message: "Orden ya pagada" });
    }

    console.log("   📡 Solicitando pago a NowPayments...");
    const payment = await createPayment({
      amount: order.totalUSD,
      orderId: order.orderId
    });

    console.log("   ✅ Respuesta de NowPayments recibida");
    console.log("   🪙 Payment ID:", payment.payment_id);
    console.log("   📍 Dirección de pago:", payment.pay_address);
    console.log("   💰 Cantidad:", payment.pay_amount, payment.pay_currency);

    order.paymentId = payment.payment_id;
    order.paymentMethod = "crypto";
    await order.save();

    console.log("✅ Pago crypto creado exitosamente");
    console.log("   🆔 Payment ID:", payment.payment_id);

    res.json({
      payAddress: payment.pay_address,
      amount: payment.pay_amount,
      currency: payment.pay_currency,
      paymentId: payment.payment_id
    });
  } catch (error) {
    console.error("🔥 Error creando pago crypto:", error.message);
    res.status(500).json({ message: "Error creando pago" });
  }
};

const createStripePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("💳 ➕ Creando sesión de pago con Stripe");
    console.log("   🆔 Order ID:", orderId);

    const order = await Order.findOne({ orderId }).populate("product");
    
    if (!order) {
      console.warn("⚠️ Orden no encontrada:", orderId);
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log("   ✅ Orden encontrada");
    console.log("   💵 Total: $", order.totalUSD.toLocaleString());
    console.log("   📧 Email cliente:", order.customer.email);
    console.log("   📊 Estado actual:", order.paymentStatus);

    if (order.paymentStatus === "paid") {
      console.warn("⚠️ La orden ya está pagada");
      return res.status(400).json({ message: "Orden ya pagada" });
    }

    console.log("   📡 Creando sesión en Stripe...");
    const session = await stripeSession({
      orderId: order.orderId,
      amount: order.totalUSD,
      customerEmail: order.customer.email,
      productName: order.product?.name || "Producto JANDROGEN"
    });

    console.log("   ✅ Sesión de Stripe creada");
    console.log("   🆔 Session ID:", session.id);
    console.log("   🔗 URL de pago:", session.url);

    order.paymentId = session.id;
    order.paymentMethod = "stripe";
    await order.save();

    console.log("✅ Sesión Stripe creada exitosamente");
    console.log("   🔗 Redirigir al cliente a:", session.url);

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("🔥 Error creando pago Stripe:", error.message);
    res.status(500).json({ message: "Error procesando pago con Stripe" });
  }
};

module.exports = {
  createCryptoPayment,
  createStripePayment
};
