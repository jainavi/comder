const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getLeaderBoard } = require('../../utilityFunctions/manager');
const errorHandler = require('../../utilityFunctions/errorHandler');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-leaderboard')
		.setDescription('Shows the leaderboard')
		.addNumberOption((option) =>
			option
				.setName('days')
				.setDescription('Set the number of days')
				.setRequired(false)
		),
	async execute(interaction) {
		await interaction.deferReply();
		const period = interaction.options.getNumber('days') || 1;

		try {
			const statsArr = await getLeaderBoard(period);
			const leaderboardEmbed = new EmbedBuilder()
				.setTitle(`**⚔️🌟 ${period} DAY LEADERBOARD 🌟⚔️**`)
				.setColor('#ffd700')
				.addFields(
					{ name: '\u200B', value: '\u200B' },
					{
						name: '🥇 Champion',
						value: `${
							statsArr.length >= 0
								? `<@${statsArr[0].user.discordId}> 🏆\n**\`t: ${statsArr[0].All}\`   \`e: ${statsArr[0].Easy}\`   \`m: ${statsArr[0].Medium}\`   \`h :${statsArr[0].Hard}\`\n\`total-points: ${statsArr[0].totalPoints}\`**`
								: 'N/A'
						}`,
					},
					{ name: '\u200B', value: '\u200B' },
					{
						name: '🥈 Runner-Up',
						value: `${
							statsArr.length >= 1
								? `<@${statsArr[1].user.discordId}> 🏆\n**\`t: ${statsArr[1].All}\`   \`e: ${statsArr[1].Easy}\`   \`m: ${statsArr[1].Medium}\`   \`h :${statsArr[1].Hard}\`\n\`total-points: ${statsArr[1].totalPoints}\`**`
								: 'N/A'
						}`,
					},
					{ name: '\u200B', value: '\u200B' },
					{
						name: '🥉 Third Place',
						value: `${
							statsArr.length >= 2
								? `<@${statsArr[2].user.discordId}> 🏆\n**\`t: ${statsArr[2].All}\`   \`e: ${statsArr[2].Easy}\`   \`m: ${statsArr[2].Medium}\`   \`h :${statsArr[2].Hard}\`\n\`total-points: ${statsArr[2].totalPoints}\`**`
								: 'N/A'
						}`,
					},
					{ name: '\u200B', value: '\u200B' },
					{
						name: '🌟🏅 Honorable Mention',
						value: `${
							statsArr.length >= 3
								? `<@${statsArr[3].user.discordId}> 🏆\n**\`t: ${statsArr[3].All}\`   \`e: ${statsArr[3].Easy}\`   \`m: ${statsArr[3].Medium}\`   \`h :${statsArr[3].Hard}\`\n\`total-points: ${statsArr[3].totalPoints}\`**`
								: 'N/A'
						}`,
					}
				);

			await interaction.editReply({ embeds: [leaderboardEmbed] });
		} catch (err) {
			await interaction.editReply('Oops! an error occured');
			errorHandler(err);
		}
	},
};
