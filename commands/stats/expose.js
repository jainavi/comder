const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const dayjs = require('dayjs');
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
		const currDate = dayjs();
		const platformQuestionMap = new Map();

		try {
			const userObj = await User.findOne({ discordId: user.id });
			if (!userObj) {
				await interaction.editReply('No user found');
				return;
			}

			const quesArr = userObj.questionsArr.filter((doc) => {
				return currDate.diff(doc.timeStamp, 'day') <= period;
			});
			quesArr.forEach((doc) => {
				if (!platformQuestionMap.has(doc.platform)) {
					platformQuestionMap.set(doc.platform, {
						All: 0,
						Easy: 0,
						Medium: 0,
						Hard: 0,
					});
				}
				const quesObj = platformQuestionMap.get(doc.platform);
				quesObj[doc.difficulty] += doc.quantity;
				platformQuestionMap.set(doc.platform, quesObj);
			});
			let statsMsg = `<@${user.id}>'s **${period}** day stats:\n\n`;
			platformQuestionMap.forEach((value, key) => {
				statsMsg += `${key} Stats (id: ${userObj[key].id}) :\n\`t: ${value.All}\te: ${value.Easy}\tm: ${value.Medium}\th: ${value.Hard}\`\n\n`;
			});
			await interaction.editReply(
				statsMsg === `<@${user.id}>'s **${period}** day stats:\n\n`
					? 'No stats available'
					: statsMsg
			);
		} catch (err) {
			errorHandler(err);
		}
	},
};
