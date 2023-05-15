const dayjs = require('dayjs');

const User = require('../models/User');
const errorHandler = require('./errorHandler');
const leetCode = require('./leetcode');
const gfg = require('./gfg');

const pingChannelId = '1038644053950087278';

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
			const diffArr = [];

			// ITERATING OVER EACH PLATFORM
			await Promise.all(
				platformArr.map((platformObj) => {
					const oldStats = user[platformObj.name].stats;
					const newStats = platformObj.userStats.get(discordId);

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
					user[platformObj].stats = newStats;
				})
			);
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
			diffMap.forEach((diffArr) => {
				diffArr.forEach((platformEntry) => {
					platformEntry.diff.forEach(async (data) => {
						if (data.count > 0) {
							await channel.send(
								`**${platformEntry.nickName}**(lc_id: ${platformEntry.leetCodeId}) se **${platformEntry.platform}** me **${data.count}** **${data.difficulty}** ques. nipat gae`
							);
						}
					});
				});
			});
		} catch (err) {
			errorHandler(err);
		}
	}, 6000);
};

module.exports = { ping };
