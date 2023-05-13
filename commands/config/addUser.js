const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const { fetchOne } = require('../../utilityFunctions/leetcode');
const User = require('../../models/User');
const errorHandler = require('../../utilityFunctions/errorHandler');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-user')
		.setDescription('Adds a new user to the database')
		.addStringOption((option) =>
			option
				.setName('leetcode-id')
				.setDescription('Sets the leetcode id')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('gfg-id').setDescription('Sets the gfg id').setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('code-studio-id')
				.setDescription('Sets the code studio id')
				.setRequired(false)
		)
		.addUserOption((option) =>
			option
				.setName('tag-the-user')
				.setDescription('Sets the discord id')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('nickname')
				.setDescription('Sets the username')
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply();

		const discordId = interaction.options.getUser('tag-the-user').id;
		const leetcodeId = interaction.options.getString('leetcode-id');
		const gfgId = interaction.options.getString('gfg-id');
		const codeStudioId = interaction.options.getString('code-studio-id');
		const nickName = interaction.options.getString('nickname');
		try {
			const userData = await User.find({ discordId: discordId });
			if (userData.length > 0) {
				await interaction.editReply('User already exist');
				return;
			}
			const leetCodeData = await fetchOne(leetcodeId);
			const user = new User({
				discordId,
				nickName,
				leetCode: {
					id: leetcodeId,
					stats: leetCodeData,
				},
				gfg: {
					id: gfgId,
				},
				codeStudio: {
					id: codeStudioId,
				},
			});
			await user.save();
			await interaction.editReply('User Added!');
		} catch (err) {
			await interaction.editReply('Oops! an error occured');
			errorHandler(err);
		}
	},
};
