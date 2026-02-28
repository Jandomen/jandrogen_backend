const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmation = async (to, orderId) => {
  try {
    console.log("📧 ➡️ Enviando email de confirmación de orden");
    console.log("   🆔 Order ID:", orderId);
    console.log("   📧 Destinatario:", to);

    await resend.emails.send({
      from: "JANDROGEN <orders@jandrogen.com>",
      to,
      subject: "Orden recibida · JANDROGEN",
      html: `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000; color: #fff; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #D4AF37; font-size: 32px; letter-spacing: 4px; margin: 0;">JANDROGEN</h1>
            <p style="color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">High End Craftsmanship</p>
          </div>
          <div style="background: #111; padding: 30px; border-radius: 15px; border: 1px solid #333;">
            <h2 style="color: #fff; margin-top: 0;">Gracias por elegir la exclusividad.</h2>
            <p style="color: #ccc; line-height: 1.6;">Tu orden <b style="color: #D4AF37;">${orderId}</b> ha sido registrada con éxito en nuestro sistema artesanal.</p>
            <p style="color: #ccc; line-height: 1.6;">Nuestro equipo técnico está validando los detalles de tu configuración técnica. Te notificaremos en cuanto el pago sea procesado para iniciar la producción.</p>
          </div>
          <div style="text-align: center; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px;">
            <p style="color: #666; font-size: 12px;">© 2026 JANDROGEN. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    });

    console.log("✅ Email de confirmación enviado");
  } catch (error) {
    console.error("🔥 Error enviando email de confirmación:", error.message);
  }
};

const sendPaymentConfirmed = async (to, orderId) => {
  try {
    console.log("📧 ➡️ Enviando email de pago confirmado");
    console.log("   🆔 Order ID:", orderId);
    console.log("   📧 Destinatario:", to);

    await resend.emails.send({
      from: "JANDROGEN <payments@jandrogen.com>",
      to,
      subject: "Pago confirmado · JANDROGEN",
      html: `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000; color: #fff; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #D4AF37; font-size: 32px; letter-spacing: 4px; margin: 0;">JANDROGEN</h1>
            <p style="color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">Payment Verified</p>
          </div>
          <div style="background: #111; padding: 30px; border-radius: 15px; border: 1px solid #333; text-align: center;">
            <div style="color: #22c55e; font-size: 48px; margin-bottom: 20px;">✓</div>
            <h2 style="color: #fff; margin-top: 0;">Inversión Confirmada</h2>
            <p style="color: #ccc; line-height: 1.6;">El pago de la orden <b style="color: #D4AF37;">${orderId}</b> ha sido verificado.</p>
            <p style="color: #ccc; line-height: 1.6;">Tu pieza ha entrado oficialmente en la <b>fase de producción artesanal</b>. Recibirás actualizaciones periódicas sobre el estado de fabricación.</p>
          </div>
          <div style="text-align: center; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/tracking" style="display: inline-block; padding: 15px 30px; background: #D4AF37; color: #000; text-decoration: none; font-weight: bold; border-radius: 10px;">RASTREAR MI ORDEN</a>
          </div>
        </div>
      `
    });

    console.log("✅ Email de pago confirmado enviado");
  } catch (error) {
    console.error("🔥 Error enviando email de pago:", error.message);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmed
};
