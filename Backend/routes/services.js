const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");

router.post("/searchResources", servicesController.searchResources);
router.post("/explain", servicesController.explain);
router.post("/scan", servicesController.scan);

module.exports = router;
