const express = require("express");
const router = express.Router();
const {
	getPlots,
	newPlot,
	showNewPlotForm,
	getPlot,
	updatePlot,
	deletePlot,
} = require("../controllers/plots");

router.route("/").get(getPlots).post(newPlot);
router.route("/new").get(showNewPlotForm);
router.route("/edit/:id").get(getPlot);
router.route("/update/:id").post(updatePlot);
router.route("/delete/:id").post(deletePlot);

module.exports = router;
