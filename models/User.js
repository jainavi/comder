const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	discordId: { type: String, required: true },
	nickName: { type: String, required: true },
	leetCode: {
		id: { type: String, required: true },
		stats: {
			type: [{ difficulty: { type: String }, count: { type: Number } }],
			default: [],
		},
	},
	gfg: {
		id: { type: String, required: true },
		stats: {
			type: [{ difficulty: { type: String }, count: { type: Number } }],
			default: [],
		},
	},
	codeStudio: {
		id: { type: String },
		stats: {
			type: [{ difficulty: { type: String }, count: { type: Number } }],
			default: [],
		},
	},
	questionsArr: {
		type: [
			{
				platform: { type: String, required: true },
				difficulty: { type: String, required: true },
				quantity: { type: Number, required: true },
				timeStamp: { type: Object, required: true },
			},
		],
		default: [],
	},
});

module.exports = mongoose.model('User', userSchema);
