// 🚀 Iniciando servidor
console.log("🚀 Iniciando servidor...");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

mongoose.connect('mongodb://localhost:27017/inventarioRopa')
  .then(async () => {
    console.log("✅ Conectado a MongoDB");
    const countTallas = await Talla.countDocuments();
    if (countTallas === 0) {
      const tallasIniciales = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
      for (let t of tallasIniciales) {
        await new Talla({ nombre: t }).save();
      }
    }
    const countUnidades = await UnidadMedida.countDocuments();
    if (countUnidades === 0) {
      const unidadesIniciales = ["Unidad", "Pack"];
      for (let u of unidadesIniciales) {
        await new UnidadMedida({ nombre: u }).save();
      }
    }
  })
  .catch(err => {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    process.exit(1); 
  });

const marcaSchema = new mongoose.Schema({ nombre: { type: String, required: true, unique: true, trim: true } }, { timestamps: true });
const Marca = mongoose.model('Marca', marcaSchema);

const categoriaSchema = new mongoose.Schema({ nombre: { type: String, required: true, unique: true, trim: true } }, { timestamps: true });
const Categoria = mongoose.model('Categoria', categoriaSchema);

const tallaSchema = new mongoose.Schema({ nombre: { type: String, required: true, unique: true, trim: true } }, { timestamps: true });
const Talla = mongoose.model('Talla', tallaSchema);

const unidadMedidaSchema = new mongoose.Schema({ nombre: { type: String, required: true, unique: true, trim: true } }, { timestamps: true });
const UnidadMedida = mongoose.model('UnidadMedida', unidadMedidaSchema);

const prendaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  marca: { type: String, required: true },
  genero: { type: String, required: true },
  categoria: { type: String, required: true },
  talla: { type: String, required: true },
  unidadMedida: { type: String, required: true },
  estado: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true, default: 1 },
  comentario: { type: String, default: "" },
  imagen: { type: String, required: true },
  vendido: { type: Boolean, default: false }
}, { timestamps: true });

const Prenda = mongoose.model('Prenda', prendaSchema);

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

app.get('/marcas', async (req, res) => {
  try { const marcas = await Marca.find().sort({ nombre: 1 }); res.json(marcas); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post('/marcas', async (req, res) => {
  try {
    let nombreOriginal = req.body.nombre.trim();
    if (!nombreOriginal) return res.status(400).json({ error: "Vacío." });
    let nombreLimpio = nombreOriginal.replace(/[^\w\s]/gi, "").trim();
    let nombreFormateado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
    let nombreNormalizado = normalizarTexto(nombreOriginal);

    const todas = await Marca.find();
    if (todas.some(m => normalizarTexto(m.nombre) === nombreNormalizado)) return res.status(400).json({ error: "Ya existe." });

    const nueva = new Marca({ nombre: nombreFormateado });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) { res.status(400).json({ error: "Error" }); }
});

app.delete('/marcas/:id', async (req, res) => {
  try { await Marca.findByIdAndDelete(req.params.id); res.json({ mensaje: "Eliminada" }); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.get('/categorias', async (req, res) => {
  try { const categorias = await Categoria.find().sort({ nombre: 1 }); res.json(categorias); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post('/categorias', async (req, res) => {
  try {
    let nombreOriginal = req.body.nombre.trim();
    if (!nombreOriginal) return res.status(400).json({ error: "Vacío." });
    let nombreLimpio = nombreOriginal.replace(/[^\w\s]/gi, "").trim();
    let nombreFormateado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
    let nombreNormalizado = normalizarTexto(nombreOriginal);

    const todas = await Categoria.find();
    if (todas.some(c => normalizarTexto(c.nombre) === nombreNormalizado)) return res.status(400).json({ error: "Ya existe." });

    const nueva = new Categoria({ nombre: nombreFormateado });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) { res.status(400).json({ error: "Error" }); }
});

app.delete('/categorias/:id', async (req, res) => {
  try { await Categoria.findByIdAndDelete(req.params.id); res.json({ mensaje: "Eliminada" }); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.get('/tallas', async (req, res) => {
  try { const tallas = await Talla.find().sort({ nombre: 1 }); res.json(tallas); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post('/tallas', async (req, res) => {
  try {
    let nombreOriginal = req.body.nombre.trim();
    if (!nombreOriginal) return res.status(400).json({ error: "Vacío." });
    let nombreFormateado = nombreOriginal.toUpperCase();
    let nombreNormalizado = normalizarTexto(nombreOriginal);

    const todas = await Talla.find();
    if (todas.some(t => normalizarTexto(t.nombre) === nombreNormalizado)) return res.status(400).json({ error: "Ya existe." });

    const nueva = new Talla({ nombre: nombreFormateado });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) { res.status(400).json({ error: "Error" }); }
});

app.delete('/tallas/:id', async (req, res) => {
  try { await Talla.findByIdAndDelete(req.params.id); res.json({ mensaje: "Eliminada" }); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.get('/unidades', async (req, res) => {
  try { const unidades = await UnidadMedida.find().sort({ nombre: 1 }); res.json(unidades); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post('/unidades', async (req, res) => {
  try {
    let nombreOriginal = req.body.nombre.trim();
    if (!nombreOriginal) return res.status(400).json({ error: "Vacío." });
    let nombreFormateado = nombreOriginal.charAt(0).toUpperCase() + nombreOriginal.slice(1).toLowerCase();
    let nombreNormalizado = normalizarTexto(nombreOriginal);

    const todas = await UnidadMedida.find();
    if (todas.some(u => normalizarTexto(u.nombre) === nombreNormalizado)) return res.status(400).json({ error: "Ya existe." });

    const nueva = new UnidadMedida({ nombre: nombreFormateado });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) { res.status(400).json({ error: "Error" }); }
});

app.delete('/unidades/:id', async (req, res) => {
  try { await UnidadMedida.findByIdAndDelete(req.params.id); res.json({ mensaje: "Eliminada" }); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.get('/prendas', async (req, res) => {
  try { const prendas = await Prenda.find(); res.json(prendas); }
  catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post('/prendas', upload.single('imagen'), async (req, res) => {
  try {
    const { categoria, marca, genero, talla } = req.body;

    const catCode = categoria.substring(0, 4).toUpperCase();
    const marCode = marca.substring(0, 3).toUpperCase();
    const genCode = genero.substring(0, 3).toUpperCase();
    const talCode = talla.toUpperCase();

    const prefijoBase = `${catCode}-${marCode}-${genCode}-${talCode}`;

    const expresionesSimilares = await Prenda.find({ codigo: new RegExp(`^${prefijoBase}`) });
    const correlativo = (expresionesSimilares.length + 1).toString().padStart(3, '0');
    
    const codigoGenerado = `${prefijoBase}-${correlativo}`;

    let imagenUrl = "";
    if (req.file) imagenUrl = `http://192.168.100.13:5000/uploads/${req.file.filename}`;

    const nueva = new Prenda({
      codigo: codigoGenerado,
      nombre: req.body.nombre,
      marca: req.body.marca,
      genero: req.body.genero,
      categoria: req.body.categoria,
      talla: req.body.talla,
      unidadMedida: req.body.unidadMedida,
      precio: req.body.precio,
      cantidad: req.body.cantidad || 1,
      estado: req.body.estado,
      comentario: req.body.comentario || "",
      imagen: imagenUrl
    });

    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) { res.status(400).json({ error: "Error al guardar la prenda." }); }
});

app.put('/prendas/:id', upload.single('imagen'), async (req, res) => {
  try {
    const datosActualizados = {
      nombre: req.body.nombre,
      marca: req.body.marca,
      genero: req.body.genero,
      categoria: req.body.categoria,
      talla: req.body.talla,
      unidadMedida: req.body.unidadMedida,
      precio: req.body.precio,
      cantidad: req.body.cantidad || 1,
      estado: req.body.estado,
      comentario: req.body.comentario || ""
    };
    if (req.file) datosActualizados.imagen = `http://192.168.100.13:5000/uploads/${req.file.filename}`;

    const prendaModificada = await Prenda.findByIdAndUpdate(req.params.id, datosActualizados, { new: true, runValidators: true });
    if (!prendaModificada) return res.status(404).json({ error: "No encontrada" });
    res.json(prendaModificada);
  } catch (err) { res.status(500).json({ error: "Error" }); }
});

// Ruta PUT para marcar como vendido desde el panel
app.put('/prendas/:id/vender', async (req, res) => {
  try {
    const prenda = await Prenda.findByIdAndUpdate(req.params.id, { vendido: true }, { new: true, runValidators: true });
    if (!prenda) return res.status(404).json({ error: "No encontrada" });
    res.json(prenda);
  } catch (err) { res.status(500).json({ error: "Error" }); }
});

// Ruta GET para escanear QR y marcar como VENDIDO desde el celular
app.get('/prendas/:id/vender', async (req, res) => {
  try {
    const prenda = await Prenda.findByIdAndUpdate(req.params.id, { vendido: true }, { new: true, runValidators: true });
    if (!prenda) return res.status(404).send("Prenda no encontrada");
    
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Venta Exitosa - Newen Store</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body class="bg-gray-50 flex items-center justify-center h-screen p-4">
          <div class="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-100">
              <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
              <h1 class="text-xl font-bold text-gray-900 mb-1">¡Prenda Vendida!</h1>
              <p class="text-sm font-semibold text-indigo-600 mb-2">${prenda.nombre}</p>
              <p class="text-xs text-gray-500 mb-6">El inventario se ha actualizado correctamente en el sistema.</p>
              <div class="bg-gray-50 p-3 rounded-xl border text-xs text-gray-600">
                  Código: <span class="font-bold">${prenda.codigo}</span><br>
                  Precio: <span class="font-bold text-indigo-600">$${prenda.precio.toLocaleString('es-CL')}</span>
              </div>
          </div>
      </body>
      </html>
    `);
  } catch (err) { 
    res.status(500).send("Error al procesar la venta"); 
  }
});

// RUTA GET NUEVA: Permite escanear QR para ANULAR la venta y dejarla disponible nuevamente
app.get('/prendas/:id/anular', async (req, res) => {
  try {
    const prenda = await Prenda.findByIdAndUpdate(req.params.id, { vendido: false }, { new: true, runValidators: true });
    if (!prenda) return res.status(404).send("Prenda no encontrada");
    
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Venta Anulada - Newen Store</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body class="bg-gray-50 flex items-center justify-center h-screen p-4">
          <div class="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-100">
              <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">↩</div>
              <h1 class="text-xl font-bold text-gray-900 mb-1">¡Venta Anulada!</h1>
              <p class="text-sm font-semibold text-indigo-600 mb-2">${prenda.nombre}</p>
              <p class="text-xs text-gray-500 mb-6">La prenda vuelve a estar disponible en el inventario.</p>
              <div class="bg-gray-50 p-3 rounded-xl border text-xs text-gray-600">
                  Código: <span class="font-bold">${prenda.codigo}</span><br>
                  Estado: <span class="font-bold text-emerald-600">DISPONIBLE</span>
              </div>
          </div>
      </body>
      </html>
    `);
  } catch (err) { 
    res.status(500).send("Error al anular la venta"); 
  }
});

app.delete('/prendas/:id', async (req, res) => {
  try {
    const prendaEliminada = await Prenda.findByIdAndDelete(req.params.id);
    if (!prendaEliminada) return res.status(404).json({ error: "Prenda no encontrada" });
    res.json({ mensaje: "Prenda eliminada correctamente" });
  } catch (err) { 
    res.status(500).json({ error: "Error al eliminar la prenda" }); 
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`); });