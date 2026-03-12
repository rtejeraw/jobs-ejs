const Plot = require("../models/Plot");
const parseVErr = require("../utils/parseValidationErrs");

const getPlots = async (req, res) => {
	let plots;
	try {
		plots = await Plot.find();
	} catch (e) {
		req.flash("error", "That word did't work!");
	}

	res.render("plots", { plots: plots || [] });
};

const newPlot = async (req, res) => {
	const { unitType: unitType } = req.body;
	try {
		await Plot.create({ userId: req.user._id, unitType: unitType });
	} catch (e) {
		req.flash("error", "That did't work!");
	}
	req.flash("info", "Entry added!");
	res.redirect("/plots");
};

const showNewPlotForm = (req, res) => {
	res.render("plot", { plot: null });
};

const getPlot = async (req, res) => {
	const { id: plotId } = req.params;
	let plot;
	try {
		plot = await Plot.findById(plotId);
	} catch (e) {
		req.flash("error", "That did't work!");
	}
	res.render("plot", { plot: plot });
};

const updatePlot = async (req, res) => {
	const { id: plotId } = req.params;

	try {
		await Plot.findByIdAndUpdate(plotId, req.body);
	} catch (e) {
		req.flash("error", "That did't work!");
	}
	req.flash("info", "Entry updated!");
	res.redirect("/plots");
};

const deletePlot = async (req, res) => {
	const { id: plotId } = req.params;

	try {
		await Plot.findByIdAndDelete(plotId);
	} catch (e) {
		req.flash("error", "That did't work!");
	}
	req.flash("info", "Entry deleted!");
	res.redirect("/plots");
};

module.exports = {
	getPlots,
	newPlot,
	showNewPlotForm,
	getPlot,
	updatePlot,
	deletePlot,
};
