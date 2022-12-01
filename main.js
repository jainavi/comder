const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const mongoose = require("mongoose");

const updateDatabase = require("./utilityFunctions/updateDatabase"); //requires client access
const leetcodeManager = require("./utilityFunctions/leetcodeManager");
const keepAlive = require("./server");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const lcManager = leetcodeManager(client);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

// Maps all commands to the client
const commandsPath = path.join(__dirname, "commands");
client.commands = new Collection();
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Maps all the Event Listner
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

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.p5unwig.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`
  )
  .then((result) => {
    console.log("Connected to DataBase!");
    setInterval(async () => {
      try {
        await updateDatabase(client);
        console.log("All User Database Updated");
        lcManager
          .leetcodeStatsLive()
          .then(() => console.log("All Users Stats Updated"))
          .catch((err) => {
            console.log(err);
            console.log("Can't show leetcode stats live");
          });
      } catch (e) {
        console.log(e);
        console.log("Can't Update Database !");
      }
    }, 600000);
    client.login(process.env.TOKEN).catch((err) => {
      console.log(err);
    });
    keepAlive();
  })
  .catch((err) => console.log(err));
