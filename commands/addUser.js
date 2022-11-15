const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const { fetchOne } = require("../utilityFunctions/fetchLeetcode");
const User = require("../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-user")
    .setDescription("Adds a new user to the database")
    .addStringOption((option) =>
      option
        .setName("leetcode-id")
        .setDescription("Sets the leetcode id")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("tag-the-user")
        .setDescription("Sets the discord id")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("Sets the username")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const discordId = interaction.options.getUser("tag-the-user").id;
    const leetcodeId = interaction.options.getString("leetcode-id");
    const nickName = interaction.options.getString("nickname");

    let userData;
    try {
      userData = await User.find({ discordId: discordId });
    } catch (e) {
      console.log(e);
      await interaction.editReply("Can't connect to database!");
      return;
    }
    if (userData.length) {
      await interaction.editReply("User already exist");
      return;
    }
    let leetCodeData = null;
    try {
      leetCodeData = await fetchOne(leetcodeId);
    } catch (e) {
      console.log(e);
      await interaction.editReply("Can't Fetch Data!");
      return;
    }
    if (leetCodeData) {
      const user = new User({
        discordId,
        nickName,
        leetCode: {
          id: leetcodeId,
          difficulty: {
            total: leetCodeData[0].count,
            easy: leetCodeData[1].count,
            medium: leetCodeData[2].count,
            hard: leetCodeData[3].count,
          },
          questions: [],
        },
      });
      user
        .save()
        .then((result) => {
          interaction.editReply("User Added!");
        })
        .catch((err) => {
          console.log(err);
          interaction.editReply("Can't Add User To Database!");
        });
    }
  },
};
