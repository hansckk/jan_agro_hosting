const router = require("express").Router();
const raja = require("../functions/rajaController");

router.get("/provinces", raja.getProvinces);
router.get("/cities", raja.getCities);
router.post("/cost", raja.getCost);

module.exports = router;
