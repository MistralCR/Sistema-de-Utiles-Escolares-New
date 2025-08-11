// Upsert de niveles básicos: Preescolar, Primaria y Secundaria
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const NivelEducativo = require("./models/NivelEducativo");

async function upsertNivelesBasicos() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await connectDB();

    const nombres = [
      { nombre: "Preescolar", descripcion: "Nivel de educación preescolar" },
      { nombre: "Primaria", descripcion: "Nivel de educación primaria" },
      { nombre: "Secundaria", descripcion: "Nivel de educación secundaria" },
    ];

    let insertados = 0;
    let actualizados = 0;

    for (const item of nombres) {
      const filter = { nombre: item.nombre, centroEducativo: "General" };
      const existing = await NivelEducativo.findOne(filter);
      if (existing) {
        // Actualizar campos si cambió la descripción o está inactivo
        const update = {};
        if (item.descripcion && existing.descripcion !== item.descripcion) {
          update.descripcion = item.descripcion;
        }
        if (existing.activo !== true) {
          update.activo = true;
        }
        if (Object.keys(update).length > 0) {
          await NivelEducativo.updateOne(filter, { $set: update });
          actualizados++;
          console.log(`♻️  Actualizado: ${item.nombre}`);
        } else {
          console.log(`✔️  Ya existe: ${item.nombre}`);
        }
      } else {
        await NivelEducativo.create({
          nombre: item.nombre,
          descripcion: item.descripcion,
          centroEducativo: "General",
          activo: true,
        });
        insertados++;
        console.log(`✅ Insertado: ${item.nombre}`);
      }
    }

    const todos = await NivelEducativo.find({
      centroEducativo: { $in: ["General"] },
      activo: true,
    }).sort({ nombre: 1 });

    console.log("\nResumen:");
    console.log(`  Insertados: ${insertados}`);
    console.log(`  Actualizados: ${actualizados}`);
    console.log(`  Total activos (General): ${todos.length}`);
    todos.forEach((n, i) => console.log(`   ${i + 1}. ${n.nombre}`));

    await mongoose.connection.close();
    console.log("🚀 Listo");
  } catch (err) {
    console.error("❌ Error:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

upsertNivelesBasicos();
