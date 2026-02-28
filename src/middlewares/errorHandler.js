const errorHandler = (err, req, res, _next) => {
  console.error("🔥 ❌ Error capturado por el middleware");
  console.error("   📍 Ruta:", req.method, req.originalUrl);
  console.error("   📊 Estado:", err.status || 500);
  console.error("   📝 Mensaje:", err.message);
  
  if (err.stack) {
    console.error("   🔍 Stack trace:", err.stack.split('\n')[1]?.trim());
  }

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor"
  });
};

module.exports = { errorHandler };
