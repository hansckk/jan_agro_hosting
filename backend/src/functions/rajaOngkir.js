const axios = require("axios");

const api = axios.create({
  baseURL: "https://api.rajaongkir.com/starter",
  headers: {
    key: process.env.RAJA_KEY,
  },
});

module.exports = api;
