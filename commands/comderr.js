const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comderr")
    .setDescription("Replies with Comdeeerrrrr!!"),
  async execute(interaction) {
    await interaction.reply("Comdeeerrrrr!!");
  },
};
