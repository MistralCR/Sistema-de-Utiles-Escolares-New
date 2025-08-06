const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI no está definida en .env");
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conexión a MongoDB Atlas exitosa");
  } catch (error) {
    console.error("Error al conectar a MongoDB Atlas:", error.message);
    throw error;
  }
};

module.exports = connectDB;
