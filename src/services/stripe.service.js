const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async ({ orderId, amount, customerEmail, productName }) => {
    try {
        console.log("💳 ➡️ Creando sesión de pago con Stripe");
        console.log("   🆔 Order ID:", orderId);
        console.log("   💵 Cantidad:", amount, "USD");
        console.log("   📧 Email cliente:", customerEmail);
        console.log("   📦 Producto:", productName);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: productName,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            customer_email: customerEmail,
            success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/${orderId}`,
            metadata: {
                orderId: orderId,
            },
        });

        console.log("✅ Sesión de Stripe creada");
        console.log("   🆔 Session ID:", session.id);
        console.log("   🔗 URL de pago:", session.url);

        return session;
    } catch (error) {
        console.error("🔥 Error creando sesión Stripe:", error.message);
        throw error;
    }
};

module.exports = { createStripeSession };
