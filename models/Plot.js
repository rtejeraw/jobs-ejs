const mongoose = require("mongoose");

const PlotSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: [true, "Please provide user"],
		},
		unitType: {
			type: String,
			enum: ["Cabbage", "Carrot", "Cow", "Sheep"],
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Plot", PlotSchema);
