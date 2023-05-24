const { SlashCommandBuilder } = require('discord.js');

const { getPeriodStats } = require('../../utilityFunctions/manager');
const errorHandler = require('../../utilityFunctions/errorHandler');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('expose')
		.setDescription('Exposes the leetcode stats')
		.addUserOption((option) =>
			option.setName('user').setDescription('Tag the user').setRequired(true)
		)
		.addNumberOption((option) =>
			option
				.setName('days')
				.setDescription('Set the number of days')
				.setRequired(false)
		),
	async execute(interaction) {
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		const period = interaction.options.getNumber('days') || 1;

		try {
			const { platformQuestionMap, userObj } = await getPeriodStats(
				user.id,
				period
			);
			if (!platformQuestionMap || platformQuestionMap.size === 0) {
				await interaction.editReply('No stats available!');
				return;
			}

			let statsMsg = `<@${user.id}>'s **${period}** day stats:\n\n`;
			platformQuestionMap.forEach((value, key) => {
				statsMsg += `${key} Stats (id: ${userObj[key].id}) :\n\`t: ${value.All}\te: ${value.Easy}\tm: ${value.Medium}\th: ${value.Hard}\`\n\n`;
			});
			await interaction.editReply(statsMsg);
		} catch (err) {
			await interaction.editReply('Oops! an error occured');
			errorHandler(err);
		}
	},
};
