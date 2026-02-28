const express = require("express");
const Order = require("../models/Order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendPaymentConfirmed } = require("../services/email.service");
const { getIO } = require("../config/socket");

const router = express.Router();

router.post("/nowpayments", express.json(), async (req, res) => {
  try {
    const {
      payment_status,
      order_id,
      payment_id,
      payin_hash
    } = req.body;

    console.log("🔔 📡 Webhook recibido de NOWPayments");
    console.log("   📊 Estado del pago:", payment_status);
    console.log("   🆔 Order ID:", order_id);
    console.log("   🆔 Payment ID:", payment_id);

    if (payment_status === "finished") {
      console.log("   💰 Pago completado, actualizando orden...");

      const order = await Order.findOneAndUpdate(
        { orderId: order_id },
        {
          paymentStatus: "paid",
          paymentId: payment_id,
          transactionHash: payin_hash
        },
        { new: true }
      );

      if (order) {
        console.log("✅ ✅ Orden marcada como PAGADA (Crypto):", order_id);
        console.log("   📧 Enviando email de confirmación...");
        
        try {
          await sendPaymentConfirmed(order.customer.email, order.orderId);
          console.log("   ✅ Email enviado");
        } catch (emailError) {
          console.warn("   ⚠️ Error enviando email:", emailError.message);
        }

        console.log("   📡 Notificando pago confirmado en tiempo real...");
        try {
          const io = getIO();
          io.to("admin-room").emit("payment-confirmed", {
            orderId: order.orderId,
            customer: order.customer.name,
            totalUSD: order.totalUSD,
            paymentMethod: "crypto",
            paidAt: new Date()
          });
          console.log("   ✅ Notificación de pago enviada");
        } catch (socketError) {
          console.warn("   ⚠️ Error en socket:", socketError.message);
        }
      } else {
        console.warn("   ⚠️ Orden no encontrada:", order_id);
      }
    } else {
      console.log("   ℹ️ Estado del pago:", payment_status);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 Error procesando webhook NOWPayments:", error.message);
    res.status(500).json({ received: false });
  }
});

router.post("/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log("🔔 📡 Webhook recibido de Stripe");

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("   ✅ Firma del webhook verificada");
    console.log("   📊 Tipo de evento:", event.type);
  } catch (err) {
    console.error("🔥 ❌ Error en firma del webhook Stripe:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    console.log("   🛒 Sesión de checkout completada");
    console.log("   🆔 Order ID:", orderId);
    console.log("   🆔 Session ID:", session.id);
    console.log("   💵 Amount:", session.amount_total / 100, session.currency);

    console.log("   💰 Marcando orden como pagada...");

    try {
      const order = await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: "paid",
          paymentId: session.id
        },
        { new: true }
      );

      if (order) {
        console.log("✅ ✅ Orden marcada como PAGADA (Stripe):", orderId);
        
        console.log("   📧 Enviando email de confirmación...");
        try {
          await sendPaymentConfirmed(order.customer.email, order.orderId);
          console.log("   ✅ Email enviado");
        } catch (emailError) {
          console.warn("   ⚠️ Error enviando email:", emailError.message);
        }

        console.log("   📡 Notificando pago confirmado en tiempo real...");
        try {
          const io = getIO();
          io.to("admin-room").emit("payment-confirmed", {
            orderId: order.orderId,
            customer: order.customer.name,
            totalUSD: order.totalUSD,
            paymentMethod: "stripe",
            paidAt: new Date()
          });
          console.log("   ✅ Notificación de pago enviada");
        } catch (socketError) {
          console.warn("   ⚠️ Error en socket:", socketError.message);
        }
      } else {
        console.warn("   ⚠️ Orden no encontrada:", orderId);
      }
    } catch (error) {
      console.error("🔥 Error actualizando orden tras Stripe:", error.message);
    }
  }

  res.json({ received: true });
});

module.exports = router;
