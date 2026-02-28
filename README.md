# JANDROGEN Backend 🔵

API REST para la plataforma de comercio electrónico B2B de equipos de hidrógeno verde.

## ✨ Características

- **API RESTful** - Endpoints completos para productos, pedidos, pagos
- **Autenticación JWT** - Login de administrador seguro
- **MongoDB/Mongoose** - Base de datos NoSQL
- **Socket.io** - Notificaciones en tiempo real
- **Pagos** - Stripe, NowPayments (Crypto), MercadoPago
- **Email** - Envío de confirmaciones con Resend
- **Cloudinary** - Almacenamiento de imágenes
- **Webhooks** - Integración con n8n
- **Logs detallados** - Console logs con emojis para debugging

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB + Mongoose** - Base de datos
- **Socket.io** - Tiempo real
- **JWT** - Autenticación
- **Bcryptjs** - Hash de contraseñas
- **Cloudinary** - Imágenes
- **Stripe** - Pagos con tarjeta
- **NowPayments** - Pagos crypto
- **Resend** - Emails
- **Multer** - Upload de archivos

## 📋 Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Iniciar producción
npm start
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz:

```env
# Servidor
PORT=4000

# Base de datos
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=tu_secret

# Admin
ADMIN_EMAIL=admin@jandrogen.com
ADMIN_PASSWORD_HASH=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Pagos
NOWPAYMENTS_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

# Email
RESEND_API_KEY=...
```

## 📁 Estructura

```
src/
├── config/
│   ├── db.js              # Conexión MongoDB
│   ├── cloudinary.js      # Config Cloudinary
│   └── socket.js          # Socket.io
├── controllers/            # Lógica de negocio
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   ├── inquiry.controller.js
│   ├── chat.controller.js
│   ├── metrics.controller.js
│   └── config.controller.js
├── models/                # Modelos Mongoose
│   ├── Product.js
│   ├── Order.js
│   ├── Inquiry.js
│   ├── GlobalConfig.js
│   └── Chat.js
├── routes/                # Rutas API
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   ├── inquiry.routes.js
│   ├── chat.routes.js
│   ├── metrics.routes.js
│   ├── config.routes.js
│   └── webhooks.routes.js
├── services/              # Servicios externos
│   ├── email.service.js
│   ├── stripe.service.js
│   ├── nowpayments.service.js
│   ├── mercadopago.service.js
│   ├── webhook.service.js
│   └── currency.service.js
├── middlewares/           # Middlewares
│   ├── jwtAuth.js
│   ├── upload.js
│   ├── errorHandler.js
│   └── validate.js
├── utils/
│   └── generateOrderId.js
├── app.js                # App Express
└── server.js             # Entry point
```

## 🔌 Endpoints API

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Login admin | ❌ |

### Productos
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/products` | Lista productos | ❌ |
| GET | `/api/products/:id` | Producto por ID | ❌ |
| POST | `/api/products/create` | Crear producto | ✅ |
| PUT | `/api/products/:id` | Actualizar producto | ✅ |
| DELETE | `/api/products/:id` | Eliminar producto | ✅ |

### Pedidos
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/orders` | Crear orden | ❌ |
| GET | `/api/orders` | Lista pedidos | ✅ |
| GET | `/api/orders/tracking/:folio` | Buscar por folio | ❌ |
| PUT | `/api/orders/:id` | Actualizar estado | ✅ |
| DELETE | `/api/orders/:id` | Eliminar orden | ✅ |

### Pagos
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/payments/crypto` | Crear pago BTC | ❌ |
| POST | `/api/payments/stripe` | Crear sesión Stripe | ❌ |

### Chat/Mensajes
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/chat` | Nueva conversación | ❌ |
| GET | `/api/chat/all` | Todas las conversaciones | ✅ |
| GET | `/api/chat/:id` | Conversación específica | ❌ |
| POST | `/api/chat/message` | Enviar mensaje | ❌ |
| PUT | `/api/chat/:id/status` | Actualizar estado | ✅ |

### Otros
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/metrics` | Métricas del dashboard | ✅ |
| GET | `/api/config` | Configuración | ❌ |
| PUT | `/api/config` | Actualizar config | ✅ |
| GET | `/api/currency/rates` | Tasas de cambio | ❌ |
| GET | `/api/health` | Health check | ❌ |

### Webhooks
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/webhooks/nowpayments` | Callback crypto |
| POST | `/api/webhooks/stripe` | Callback Stripe |

## 🔔 Eventos Socket.io

El servidor emite eventos a la sala `admin-room`:

```javascript
// Nueva orden creada
io.to("admin-room").emit("new-order", { orderId, customer, totalUSD, ... });

// Pago confirmado
io.to("admin-room").emit("payment-confirmed", { orderId, customer, totalUSD, ... });

// Nuevo mensaje de cliente
io.to("admin-room").emit("new-message", { conversationId, client, lastMessage, ... });
```

## 💳 Métodos de Pago

### Stripe
- Checkout sessions con tarjeta
- Webhook para confirmación

### NowPayments (Crypto)
- Pago en Bitcoin
- IPN callback para confirmación

### MercadoPago
- Preferencias de pago
- URLs de retorno

## 📧 Emails

- Confirmación de orden al crear
- Confirmación de pago al verificar

## 🧪 Scripts

```bash
npm start          # Producción (puerto 4000)
npm run dev        # Desarrollo con nodemon
```

## 📱 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `4000` |
| `MONGO_URI` | Conexión MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Secret para JWT | `...` |
| `ADMIN_EMAIL` | Email admin | `admin@jandrogen.com` |
| `ADMIN_PASSWORD_HASH` | Password hashado | `$2a$10$...` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name | `...` |
| `CLOUDINARY_API_KEY` | API Key | `...` |
| `CLOUDINARY_API_SECRET` | API Secret | `...` |
| `STRIPE_SECRET_KEY` | Secret Stripe | `sk_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe | `whsec_...` |
| `NOWPAYMENTS_API_KEY` | API NowPayments | `...` |
| `RESEND_API_KEY` | API Resend | `re_...` |
| `FRONTEND_URL` | URL frontend | `http://localhost:3000` |
| `BACKEND_URL` | URL backend | `http://localhost:4000` |

## 🔐 Credenciales Admin

Por defecto:
- **Email**: `admin@jandrogen.com`
- **Password**: (configurado en `ADMIN_PASSWORD_HASH` del .env)

## 📄 Licencia

Privado - © 2026 JANDROGEN SYSTEMS
