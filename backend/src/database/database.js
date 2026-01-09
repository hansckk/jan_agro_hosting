const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

async function connectDatabase() {
  try {
    if (!uri) {
      throw new Error("MONGO_URI tidak ditemukan di file .env");
    }
    await mongoose.connect(uri);

    console.log("✅ Berhasil connect ke MongoDB Atlas (Database: janAgro)");
  } catch (error) {
    console.error("❌ Gagal connect ke MongoDB: ", error);
    throw err;
  }
}

async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log("Berhasil disconnect MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB: ", error);
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
