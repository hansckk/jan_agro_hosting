const api = require("./rajaOngkir");

exports.getProvinces = async (req, res) => {
  try {
    const { data } = await api.get("/province");
    res.json(data.rajaongkir.results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { province_id } = req.query;
    const { data } = await api.get("/city", {
      params: { province: province_id },
    });
    res.json(data.rajaongkir.results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
};

exports.getCost = async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;
    const { data } = await api.post("/cost", {
      origin,
      destination,
      weight,
      courier,
    });
    res.json(data.rajaongkir.results[0].costs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cost" });
  }
};
