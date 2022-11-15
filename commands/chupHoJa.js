const { SlashCommandBuilder, bold } = require("discord.js");
const { stopSpamming } = require("../utilityFunctions/messageSend.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chup-ho-ja")
    .setDescription("Stops Spamming"),
  async execute(interaction) {
    await interaction.reply("Omk !!");
    stopSpamming();
  },
};
