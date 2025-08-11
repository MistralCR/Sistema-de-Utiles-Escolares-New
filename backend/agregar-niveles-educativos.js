// Script para poblar niveles educativos desde data/niveles esducativos/niveles.json
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const NivelEducativo = require("./models/NivelEducativo");

(async () => {
  try {
    // Conectar a DB
    await connectDB();

    // Centro a usar: CLI arg, env CENTRO_NIVELES, o "General"
    const centroArg = process.argv.slice(2).join(" ").trim();
    const centroEducativo =
      centroArg || process.env.CENTRO_NIVELES || "General";

    // Intentar leer del folder solicitado por el usuario (con espacio y typo)
    let dataPath = path.join(
      __dirname,
      "data",
      "niveles esducativos",
      "niveles.json"
    );
    if (!fs.existsSync(dataPath)) {
      // Fallback a un nombre sin espacio por si se renombra en el futuro
      const altPath = path.join(
        __dirname,
        "data",
        "niveles-educativos",
        "niveles.json"
      );
      if (fs.existsSync(altPath)) dataPath = altPath;
    }

    if (!fs.existsSync(dataPath)) {
      throw new Error(`No se encontró el archivo de datos en: ${dataPath}`);
    }

    const raw = fs.readFileSync(dataPath, "utf-8");
    const niveles = JSON.parse(raw);

    if (!Array.isArray(niveles) || niveles.length === 0) {
      throw new Error("El archivo niveles.json no contiene datos válidos");
    }

    let insertados = 0;
    let actualizados = 0;

    for (const item of niveles) {
      const { nombre, descripcion } = item;
      if (!nombre) continue;

      const existingNivel = await NivelEducativo.findOne({
        nombre: nombre.trim(),
        centroEducativo,
      });

      if (existingNivel) {
        // Si existe, actualizar solo campos necesarios
        await NivelEducativo.updateOne(
          { _id: existingNivel._id },
          {
            $set: {
              activo: true,
            },
          }
        );
        actualizados++;
      } else {
        // Si no existe, crear nuevo
        await NivelEducativo.create({
          nombre: nombre.trim(),
          descripcion: descripcion || "",
          centroEducativo,
          activo: true,
        });
        insertados++;
      }
    }

    console.log(`Centro educativo: ${centroEducativo}`);
    console.log(`Niveles procesados: ${niveles.length}`);
    console.log(`Insertados/actualizados: ${insertados}/${actualizados}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error poblando niveles:", err.message);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
})();
