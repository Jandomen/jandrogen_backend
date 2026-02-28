const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const metricsRoutes = require("./routes/metrics.routes");
const currencyRoutes = require("./routes/currency.routes");
const inquiryRoutes = require("./routes/inquiry.routes");
const configRoutes = require("./routes/config.routes");
const webhooksRoutes = require("./routes/webhooks.routes");
const chatRoutes = require("./routes/chat.routes");

const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.set("trust proxy", 1);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(cors());
app.use("/api/webhooks", webhooksRoutes); // Registered BEFORE express.json()
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/config", configRoutes);
app.use("/api/chat", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "JANDROGEN API" });
});

app.use(errorHandler);

module.exports = app;
