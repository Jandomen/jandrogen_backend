const Product = require("../models/Product");
const slugify = require("slugify");

const createProduct = async (req, res) => {
  try {
    const { name, description, priceUSD, stock, manufactureDays } = req.body;

    console.log("📦 ➕ Creando nuevo producto...");
    console.log("   📝 Nombre:", name);
    console.log("   💵 Precio USD:", priceUSD);

    if (!req.files || req.files.length === 0) {
      console.warn("⚠️ Error: No se subieron imágenes");
      return res
        .status(400)
        .json({ message: "Debe subir al menos 1 imagen" });
    }

    console.log("   🖼️ Imágenes recibidas:", req.files.length);

    const images = req.files.map(file => file.path);

    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    console.log("   🔗 Slug generado:", slug);

    const product = await Product.create({
      name,
      slug,
      description,
      priceUSD,
      stock,
      manufactureDays,
      images
    });

    console.log("✅ Producto creado exitosamente:", product.name);
    console.log("   🆔 ID:", product._id);

    res.status(201).json(product);
  } catch (error) {
    console.error("🔥 Error creando producto:", error.message);
    res.status(500).json({ message: "Error creando producto" });
  }
};

const getProducts = async (req, res) => {
  try {
    console.log("📋 ➡️ Obteniendo productos...");
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;
    
    const query = { active: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(query)
    ]);
    
    console.log("✅ Productos encontrados:", products.length, "de", total);
    
    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      }
    });
  } catch (error) {
    console.error("🔥 Error obteniendo productos:", error.message);
    res.status(500).json({ message: "Error obteniendo productos" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📋 ➡️ Buscando producto por ID:", id);
    
    const product = await Product.findById(id);
    
    if (!product) {
      console.warn("⚠️ Producto no encontrado:", id);
      return res.status(404).json({ message: "No encontrado" });
    }
    
    console.log("✅ Producto encontrado:", product.name);
    res.json(product);
  } catch (error) {
    console.error("🔥 Error obteniendo producto:", error.message);
    res.status(500).json({ message: "Error obteniendo producto" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    console.log("📦 🔄 Actualizando producto:", id);

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, {
        lower: true,
        strict: true
      });
      console.log("   📝 Nuevo nombre:", updateData.name);
    }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
      console.log("   🖼️ Nuevas imágenes:", req.files.length);
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      console.warn("⚠️ Producto no encontrado para actualizar:", id);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    console.log("✅ Producto actualizado:", updated.name);
    res.json(updated);
  } catch (error) {
    console.error("🔥 Error actualizando producto:", error.message);
    res.status(500).json({ message: "Error actualizando producto" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📦 🗑️ Desactivando producto:", id);

    const deleted = await Product.findByIdAndUpdate(id, { active: false }, { new: true });

    if (!deleted) {
      console.warn("⚠️ Producto no encontrado para eliminar:", id);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    console.log("✅ Producto desactivado:", deleted.name);
    res.json({ message: "Producto desactivado correctamente" });
  } catch (error) {
    console.error("🔥 Error eliminando producto:", error.message);
    res.status(500).json({ message: "Error eliminando producto" });
  }
};

const seedProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    console.log("🌱 ➕ Iniciando sembrado de productos...");
    console.log("   📊 Cantidad:", products?.length || 0);

    if (!products || !Array.isArray(products)) {
      console.warn("⚠️ Datos de productos inválidos");
      return res.status(400).json({ message: "Invalid products data" });
    }

    const createdProducts = [];
    for (const p of products) {
      const slug = slugify(p.name, { lower: true, strict: true });
      const { _id, ...productData } = p;

      const created = await Product.findOneAndUpdate(
        { slug },
        {
          ...productData,
          slug,
          active: true,
          stock: p.stock || 10,
          manufactureDays: p.manufactureDays || 90
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdProducts.push(created);
    }

    console.log("✅ Productos sembrados correctamente:", createdProducts.length);
    res.json({ message: `${createdProducts.length} productos sembrados correctamente`, products: createdProducts });
  } catch (error) {
    console.error("🔥 Error sembrando productos:", error.message);
    res.status(500).json({ message: "Error al sembrar productos" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts
};
