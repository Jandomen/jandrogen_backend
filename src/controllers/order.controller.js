const Order = require("../models/Order");
const Product = require("../models/Product");
const generateOrderId = require("../utils/generateOrderId");
const { triggerN8nWebhook } = require("../services/webhook.service");
const { sendOrderConfirmation } = require("../services/email.service");
const { getIO } = require("../config/socket");

const createOrder = async (req, res) => {
  try {
    const { items, customer, shippingAddress, technicalSpecs, paymentMethod } = req.body;

    console.log("🛒 ➕ Creando nueva orden...");
    console.log("   👤 Cliente:", customer.name);
    console.log("   📧 Email:", customer.email);
    console.log("   📦 Items en orden:", items.length);
    console.log("   💳 Método de pago:", paymentMethod);

    let totalUSD = 0;
    const finalItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        console.warn("⚠️ Producto no encontrado:", item.productId);
        return res.status(404).json({ message: `Producto ${item.productId} no existe` });
      }

      console.log("   📦 Producto:", product.name, "- Cantidad:", item.quantity, "- Precio: $", product.priceUSD);

      const itemTotal = product.priceUSD * item.quantity;
      totalUSD += itemTotal;
      finalItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.priceUSD
      });
    }

    console.log("   💵 Total orden: $", totalUSD.toLocaleString());

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 90);
    console.log("   📅 Entrega estimada:", estimatedDeliveryDate.toLocaleDateString());

    console.log("   💾 Guardando orden en base de datos...");
    const order = await Order.create({
      orderId: generateOrderId(),
      items: finalItems,
      totalUSD,
      customer,
      shippingAddress,
      technicalSpecs,
      paymentMethod,
      estimatedDeliveryDate
    });

    console.log("✅ Orden creada exitosamente");
    console.log("   🆔 Order ID:", order.orderId);

    console.log("   📡 Enviando webhook a n8n...");
    try {
      await triggerN8nWebhook({
        event: 'ORDER_CREATED',
        order: order
      });
      console.log("   ✅ Webhook enviado");
    } catch (webhookError) {
      console.warn("   ⚠️ Error en webhook:", webhookError.message);
    }

    console.log("   📧 Enviando email de confirmación...");
    try {
      await sendOrderConfirmation(customer.email, order.orderId);
      console.log("   ✅ Email enviado");
    } catch (emailError) {
      console.warn("   ⚠️ Error enviando email:", emailError.message);
    }

    console.log("   📡 Notificando al panel admin en tiempo real...");
    try {
      const io = getIO();
      io.to("admin-room").emit("new-order", {
        orderId: order.orderId,
        customer: order.customer.name,
        email: order.customer.email,
        totalUSD: order.totalUSD,
        paymentStatus: order.paymentStatus,
        itemsCount: order.items.length,
        createdAt: order.createdAt
      });
      console.log("   ✅ Notificación en tiempo real enviada");
    } catch (socketError) {
      console.warn("   ⚠️ Error en socket:", socketError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("🔥 Error creando orden:", error.message);
    res.status(500).json({ message: "Error creando orden" });
  }
};

const getOrders = async (req, res) => {
  try {
    console.log("🛒 ➡️ Obteniendo órdenes...");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;

    const query = {};

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).populate("items.product").skip(skip).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments(query)
    ]);

    console.log("✅ Órdenes encontradas:", orders.length, "de", total);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + orders.length < total
      }
    });
  } catch (error) {
    console.error("🔥 Error obteniendo órdenes:", error.message);
    res.status(500).json({ message: "Error obteniendo órdenes" });
  }
};

const getOrderByTrackingId = async (req, res) => {
  try {
    const { folio } = req.params;
    console.log("🔍 ➡️ Buscando orden por folio:", folio);

    const order = await Order.findOne({ orderId: folio })
      .populate("items.product");

    if (!order) {
      console.warn("⚠️ Orden no encontrada:", folio);
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log("✅ Orden encontrada:", order.orderId);
    res.json(order);
  } catch (error) {
    console.error("🔥 Error en tracking:", error.message);
    res.status(500).json({ message: "Error buscando la orden" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { paymentStatus, orderStatus } = req.body;
    const { id } = req.params;

    console.log("🛒 🔄 Actualizando orden:", id);
    console.log("   💳 Estado de pago:", paymentStatus);
    console.log("   📦 Estado de orden:", orderStatus);

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus, orderStatus },
      { new: true }
    ).populate("items.product");

    if (!order) {
      console.warn("⚠️ Orden no encontrada:", id);
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log("✅ Orden actualizada:", order.orderId);

    console.log("   📡 Enviando webhook de actualización...");
    try {
      await triggerN8nWebhook({
        event: 'ORDER_UPDATED',
        order: order
      });
      console.log("   ✅ Webhook enviado");
    } catch (webhookError) {
      console.warn("   ⚠️ Error en webhook:", webhookError.message);
    }

    res.json(order);
  } catch (error) {
    console.error("🔥 Error actualizando orden:", error.message);
    res.status(500).json({ message: "Error actualizando orden" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🛒 🗑️ Eliminando orden:", id);

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      console.warn("⚠️ Orden no encontrada:", id);
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log("✅ Orden eliminada:", order.orderId);
    res.json({ message: "Orden eliminada exitosamente" });
  } catch (error) {
    console.error("🔥 Error eliminando orden:", error.message);
    res.status(500).json({ message: "Error eliminando orden" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderByTrackingId,
  updateOrderStatus,
  deleteOrder
};
