const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  discordId: { type: String, required: true },
  nickName: { type: String, required: true },
  leetCode: {
    id: { type: String, required: true },
    difficulty: {
      total: { type: Number, required: true },
      easy: { type: Number, required: true },
      medium: { type: Number, required: true },
      hard: { type: Number, required: true },
    },
    questions: [
      {
        difficulty: String,
        difficulty: Number,
        timeStamp: Object,
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
