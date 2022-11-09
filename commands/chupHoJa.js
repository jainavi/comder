const { SlashCommandBuilder, bold } = require("discord.js");
const { stop } = require("../utilityFunctions/spam.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chup_ho_ja")
    .setDescription("Stops Spamming"),
  async execute(interaction) {
    await interaction.reply("Omk !!");
    stop();
  },
};
