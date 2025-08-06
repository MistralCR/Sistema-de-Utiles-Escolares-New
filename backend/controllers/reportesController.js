const ListaUtiles = require("../models/ListaUtiles");
const Material = require("../models/Material");
const Usuario = require("../models/Usuario");
const Categoria = require("../models/Categoria");
const NivelEducativo = require("../models/NivelEducativo");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// 1. Reporte por nivel educativo
exports.reportePorNivel = async (req, res) => {
  try {
    const nivelId = req.query.nivelEducativo || req.body.nivelEducativo;
    if (!nivelId)
      return res.status(400).json({ msg: "nivelEducativo es requerido" });
    const listas = await ListaUtiles.find({ nivelEducativo: nivelId })
      .populate("creadoPor", "nombre")
      .populate("centroEducativo", "nombre")
      .populate("materiales");
    const resultado = listas.map((lista) => ({
      nombreLista: lista.nombre,
      cantidadMateriales: lista.materiales.length,
      docente: lista.creadoPor?.nombre || "",
      centroEducativo: lista.centroEducativo?.nombre || "",
    }));
    res.json(resultado);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error en reporte por nivel", error: err.message });
  }
};

// 2. Reporte por docente
exports.reportePorDocente = async (req, res) => {
  try {
    const docenteId = req.query.docenteId || req.body.docenteId;
    if (!docenteId)
      return res.status(400).json({ msg: "docenteId es requerido" });
    const listas = await ListaUtiles.find({ creadoPor: docenteId })
      .populate("nivelEducativo", "nombre")
      .populate("centroEducativo", "nombre")
      .populate("materiales", "nombre");
    const resultado = listas.map((lista) => ({
      nombreLista: lista.nombre,
      nivelEducativo: lista.nivelEducativo?.nombre || "",
      centroEducativo: lista.centroEducativo?.nombre || "",
      cantidadMateriales: lista.materiales.length,
      materiales: lista.materiales.map((m) => m.nombre),
    }));
    res.json(resultado);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error en reporte por docente", error: err.message });
  }
};

// 3. Reporte por categoría
exports.reportePorCategoria = async (req, res) => {
  try {
    // Agrupa materiales por categoría y cuenta usos en listas
    const materiales = await Material.find({ activo: true }).populate(
      "categoria",
      "nombre"
    );
    const listas = await ListaUtiles.find({ activo: true }).populate(
      "materiales"
    );
    const usoPorMaterial = {};
    listas.forEach((lista) => {
      lista.materiales.forEach((matId) => {
        const id = matId._id.toString();
        usoPorMaterial[id] = (usoPorMaterial[id] || 0) + 1;
      });
    });
    const agrupados = {};
    materiales.forEach((mat) => {
      const nombreCat = mat.categoria?.nombre || "Sin categoría";
      if (!agrupados[nombreCat]) agrupados[nombreCat] = [];
      agrupados[nombreCat].push({
        nombre: mat.nombre,
        vecesUsado: usoPorMaterial[mat._id.toString()] || 0,
      });
    });
    res.json(agrupados);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error en reporte por categoría", error: err.message });
  }
};

// 4. Exportar Excel
exports.exportarExcel = async (req, res) => {
  try {
    const { datos, nombreHoja = "Reporte" } = req.body;
    if (!Array.isArray(datos))
      return res.status(400).json({ msg: "datos debe ser un array" });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(nombreHoja);
    if (datos.length > 0) {
      worksheet.columns = Object.keys(datos[0]).map((key) => ({
        header: key,
        key,
      }));
      datos.forEach((row) => worksheet.addRow(row));
    }
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=Reporte.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al exportar Excel", error: err.message });
  }
};

// 5. Exportar PDF
exports.exportarPDF = async (req, res) => {
  try {
    const { datos, titulo = "Reporte" } = req.body;
    if (!Array.isArray(datos))
      return res.status(400).json({ msg: "datos debe ser un array" });
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Reporte.pdf");
    doc.pipe(res);
    doc.fontSize(18).text(titulo, { align: "center" });
    doc.moveDown();
    if (datos.length > 0) {
      const keys = Object.keys(datos[0]);
      doc.fontSize(12).text(keys.join(" | "));
      doc.moveDown(0.5);
      datos.forEach((row) => {
        const line = keys.map((k) => row[k]).join(" | ");
        doc.text(line);
      });
    }
    doc.end();
  } catch (err) {
    res.status(500).json({ msg: "Error al exportar PDF", error: err.message });
  }
};
