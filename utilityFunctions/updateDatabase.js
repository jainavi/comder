const dayjs = require('dayjs');

const User = require('../models/User');
const leetcodeManager = require('./leetcodeManager');
const fetch = leetcodeManager().fetch;

let cDate = new Date(),
	nDate = new Date();
nDate.setDate(nDate.getDate() + 1);
nDate.setHours(0, 0, 0, 0);

const updateDatabase = async (client = null) => {
	dailyStatsReset = () => {
		User.find({}).then((userArr) => {
			userArr.forEach((user) => {
				user.leetCode.questionsDaily = [
					{ difficulty: 'total', quantity: 0 },
					{ difficulty: 'easy', quantity: 0 },
					{ difficulty: 'medium', quantity: 0 },
					{ difficulty: 'hard', quantity: 0 },
				];
				user.save().catch((err) => console.log(err));
			});
		});
	};

	User.find({})
		.then((usersArr) => {
			usersArr.forEach(async (user) => {
				const lcManager = leetcodeManager(client);
				const pingChannel = '1041717419460280341'; // old value is 1041717419460280341
				const freshData = await fetch(user.leetCode.id); //Array
				const staleData = user.leetCode.difficulty; //Object
				const timeStamp = dayjs();
				let questionsDaily = user.leetCode.questionsDaily;
				if (!questionsDaily || questionsDaily.length == 0) {
					questionsDaily = [
						{ difficulty: 'total', quantity: 0 },
						{ difficulty: 'easy', quantity: 0 },
						{ difficulty: 'medium', quantity: 0 },
						{ difficulty: 'hard', quantity: 0 },
					];
				}

				if (staleData.total != freshData[0].count) {
					const newQuestionQuantity = freshData[0].count - staleData.total;
					questionsDaily[0].quantity += newQuestionQuantity;
					user.leetCode.difficulty.total = freshData[0].count;
				}
				if (staleData.easy !== freshData[1].count) {
					const newQuestionQuantity = freshData[1].count - staleData.easy;
					const newQuestion = {
						difficulty: 'easy',
						quantity: newQuestionQuantity,
						timeStamp: timeStamp,
					};
					questionsDaily[1].quantity += newQuestionQuantity;
					user.leetCode.difficulty.easy = freshData[1].count;
					user.leetCode.questions.push(newQuestion);

					lcManager
						.ping(user.nickName, 'easy', newQuestionQuantity, pingChannel)
						.catch((e) => console.log(e));
				}
				if (staleData.medium !== freshData[2].count) {
					const newQuestionQuantity = freshData[2].count - staleData.medium;
					const newQuestion = {
						difficulty: 'medium',
						quantity: newQuestionQuantity,
						timeStamp: timeStamp,
					};
					questionsDaily[2].quantity += newQuestionQuantity;
					user.leetCode.difficulty.medium = freshData[2].count;
					user.leetCode.questions.push(newQuestion);

					lcManager
						.ping(user.nickName, 'medium', newQuestionQuantity, pingChannel)
						.catch((e) => console.log(e));
				}
				if (staleData.hard !== freshData[3].count) {
					const newQuestionQuantity = freshData[3].count - staleData.hard;
					const newQuestion = {
						difficulty: 'hard',
						quantity: newQuestionQuantity,
						timeStamp: timeStamp,
					};
					questionsDaily[3].quantity += newQuestionQuantity;
					user.leetCode.difficulty.hard = freshData[3].count;
					user.leetCode.questions.push(newQuestion);

					lcManager
						.ping(user.nickName, 'hard', newQuestionQuantity, pingChannel)
						.catch((e) => console.log(e));
				}
				user.leetCode.questionsDaily = questionsDaily;
				user.save().catch((err) => console.log(err));
			});

			cDate = new Date();
			if (cDate > nDate) {
				dailyStatsReset();
				nDate.setDate(nDate.getDate() + 1);
				nDate.setHours(0, 0, 0, 0);
				console.log('All Daily Stats Resetted!');
			}
		})
		.catch((err) => console.log(err));
};
module.exports = updateDatabase;
