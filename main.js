const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();

const manager = require('./utilityFunctions/manager');
const keepAlive = require('./utilityFunctions/server');
const errorHandler = require('./utilityFunctions/errorHandler');
const User = require('./models/User');

// CONFIGRATIONS
// Initializing client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessageTyping,
	],
});
// Maps all commands to the client
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}
// Maps all the Event Listner
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => {
			event.execute(...args);
		});
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
// Declaring variables
const { TOKEN, MONGO_USER, MONGO_PASSWORD } = process.env;

// LOADING THE BOT
mongoose
	.connect(
		`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.p5unwig.mongodb.net/comder?retryWrites=true&w=majority`
	)
	.then(() => {
		console.log('Connected to DataBase!');
		manager.ping(client);
		client.login(TOKEN).catch((err) => errorHandler(err));
		keepAlive();
	})
	.catch((err) => errorHandler(err));
