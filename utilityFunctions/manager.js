const dayjs = require('dayjs');

const User = require('../models/User');
const errorHandler = require('./errorHandler');
const leetCode = require('./leetcode');

const pingChannelId = '1038644053950087278';

const databaseSync = async () => {
	const userArr = await User.find({});
	const userQuestionDiffMap = new Map();
	for (let i = 0; i < userArr.length; i++) {
		userQuestionDiffMap.set(userArr[i].discordId, []);
	}

	// LEETCODE
	const newStatsMap = await leetCode.fetchAll();
	await Promise.all(
		userArr.map(async (user) => {
			const discordId = user.discordId;
			const oldStats = user.leetCode.stats;
			const newStats = newStatsMap.get(discordId);
			const diffArr = [];
			for (let j = 0; j < oldStats.length; j++) {
				const difficulty = oldStats[j].difficulty;
				const count = newStats[j].count - oldStats[j].count;
				diffArr.push({
					difficulty,
					count,
				});
				if (count > 0) {
					user.questionsArr.push({
						platform: 'leetCode',
						difficulty,
						quantity: count,
						timeStamp: dayjs(),
					});
				}
			}
			userQuestionDiffMap
				.get(discordId)
				.push({ platform: 'leetCode', diff: diffArr, userName: user.nickName });
			user.leetCode.stats = newStats;
			await user.save();
		})
	);

	console.log('database updated');
	return userQuestionDiffMap;
};

const ping = (client) => {
	setInterval(async () => {
		try {
			const diffMap = await databaseSync();
			const channel = client.channels.cache.get(pingChannelId);
			diffMap.forEach((diffArr, discordId) => {
				diffArr.forEach((platformEntry) => {
					platformEntry.diff.forEach(async (data) => {
						if (data.count > 0) {
							await channel.send(
								`${platformEntry.userName} se ${platformEntry.platform} me ${data.count} ${data.difficulty} ques. nipat gae`
							);
						}
					});
				});
			});
			console.log('Pinged!');
		} catch (err) {
			errorHandler(err);
		}
	}, 6000);
};

module.exports = { ping };