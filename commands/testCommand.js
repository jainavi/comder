const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testCommand")
    .setDescription("This is just a test command")
    .addStringOption((option) => option.setName("test").setDescription("Test")),

  async execute(interaction) {
    await interaction.reply("");
    const channel = client.channels.cache.get("id");
    channel.send("content");
  },
};
