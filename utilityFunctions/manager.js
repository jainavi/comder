const { EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');

const User = require('../models/User');
const errorHandler = require('./errorHandler');
const leetCode = require('./leetcode');
const gfg = require('./gfg');

const pingChannelId = '1038644053950087278';
const errorChannelId = '1038644053950087278';

const databaseSync = async () => {
	const userArr = await User.find({});
	const userQuestionDiffMap = new Map();
	for (let i = 0; i < userArr.length; i++) {
		userQuestionDiffMap.set(userArr[i].discordId, []);
	}

	// PREPARING THE PLATFORM ARRAY
	const platformArr = [leetCode, gfg];
	for (let i = 0; i < platformArr.length; i++) {
		const platformObj = platformArr[i];
		const userStats = await platformObj.fetchAll();
		platformObj.userStats = userStats;
	}

	// ITERATING OVER THE USERS
	await Promise.all(
		userArr.map(async (user) => {
			const discordId = user.discordId;

			// ITERATING OVER EACH PLATFORM
			await Promise.all(
				platformArr.map((platformObj) => {
					const oldStats = user[platformObj.name].stats;
					const newStats = platformObj.userStats.get(discordId);
					const diffArr = [];
					if (!newStats) {
						return;
					}
					// ITERATING OVER EACH DIFFICULTIES
					for (let j = 0; j < oldStats.length; j++) {
						const difficulty = oldStats[j].difficulty;
						const count = newStats[j].count - oldStats[j].count;
						diffArr.push({
							difficulty,
							count,
						});
						if (count > 0) {
							user.questionsArr.push({
								platform: platformObj.name,
								difficulty,
								quantity: count,
								timeStamp: dayjs(),
							});
						}
					}
					userQuestionDiffMap.get(discordId).push({
						platform: platformObj.name,
						diff: diffArr,
						nickName: user.nickName,
						leetCodeId: user.leetCode.id,
					});
					user[platformObj.name].stats = newStats;
				})
			);
			await user.save();
		})
	);

	console.log('database updated');
	return userQuestionDiffMap;
};

const ping = (client) => {
	setTimeout(async () => {
		try {
			const diffMap = await databaseSync();
			const channel = client.channels.cache.get(pingChannelId);
			diffMap.forEach((diffArr) => {
				diffArr.forEach((platformEntry) => {
					platformEntry.diff.forEach(async (data) => {
						if (data.count > 0 && data.difficulty != 'All') {
							await channel.send(
								`**${platformEntry.nickName}**(lc_id: ${
									platformEntry.leetCodeId
								}) ${platformEntry.platform.toUpperCase()} --> **${data.count} ${
									data.difficulty
								}**`
							);
						}
					});
				});
			});
		} catch (err) {
			errorHandler(err, async () => {
				const channel = client.channels.cache.get(errorChannelId);
				await channel.send(
					'Something went wrong! Please refer ./error.log for more info'
				);
			});
		}
	}, 6000);
};

const getPeriodStats = async (userId, period = 1) => {
	const currDate = dayjs();
	const platformQuestionMap = new Map();

	const userObj = await User.findOne({ discordId: userId });
	if (!userObj) {
		// eslint-disable-next-line quotes
		return { platformQuestionMap: null, userObj };
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
	return { platformQuestionMap, userObj };
};

const getLeaderBoard = async (period = 1) => {
	const userArr = await User.find({}, 'discordId');

	const userStatsArr = [];
	await Promise.all(
		userArr.map(async (userObj) => {
			const statsObj = {
				totalPoints: 0,
				All: 0,
				Easy: 0,
				Medium: 0,
				Hard: 0,
			};

			const { platformQuestionMap: periodStats, userObj: user } =
				await getPeriodStats(userObj.discordId, period);

			periodStats.forEach((value, key) => {
				statsObj.All += value.All;
				statsObj.Easy += value.Easy;
				statsObj.Medium += value.Medium;
				statsObj.Hard += value.Hard;
				statsObj.totalPoints += value.Easy * 1 + value.Medium * 2 + value.Hard * 4;
			});
			statsObj.user = user;
			userStatsArr.push(statsObj);
		})
	);
	userStatsArr.sort((a, b) => b.totalPoints - a.totalPoints);
	return userStatsArr;
};

const showDailyLeaderBoard = async (client) => {
	const channel = client.channels.cache.get(pingChannelId);
	const now = new Date();
	const targetTime = new Date();
	targetTime.setUTCHours(19, 45, 0, 0);
	let delay = targetTime.getTime() - now.getTime();
	if (delay < 0) {
		const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
		delay += oneDayInMilliseconds;
	}

	setTimeout(async () => {
		const statsArr = await getLeaderBoard();
		const leaderboardEmbed = new EmbedBuilder()
			.setTitle('**⚔️🌟 DAILY LEADERBOARD UPDATE 🌟⚔️**')
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

		await channel.send({ embeds: [leaderboardEmbed] });
		showDailyLeaderBoard(client);
	}, delay);
};

module.exports = { ping, getPeriodStats, getLeaderBoard, showDailyLeaderBoard };
