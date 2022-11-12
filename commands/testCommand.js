const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const data = require("../config.json");
const fs = require("node:fs");
const User = require("../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testcommand")
    .setDescription("This is just a test command")
    .addUserOption((option) =>
      option
        .setName("tag-the-user")
        .setDescription("Sets the discord id")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply("Logged!");
    const user = interaction.options.getUser("tag-the-user").id;
  },
};
