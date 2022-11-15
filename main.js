const fs = require("node:fs");
const path = require("node:path");

const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const { token } = require("./config.json");
const mongoose = require("mongoose");

const updateDatabase = require("./utilityFunctions/updateDatabase");
const leetCodeStatsLive = require("./utilityFunctions/leetcodeStatsLive");
const { send } = require("./utilityFunctions/messageSend");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

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
      send(
        client.channels.cache.get("1041717419460280341"),
        "Comdeerr Bot is Now Watching All COMDEERRSSSS!!......comdddeeeerrrrrrrrrrrr"
      ).catch((err) => console.log(err));
      leetCodeStatsLive(client).catch((err) => console.log(err));
      setInterval(async () => {
        await updateDatabase().catch((err) => console.log(err));
        console.log("All User Database Updated");
      }, 600000);
    });
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

mongoose
  .connect(
    "mongodb+srv://backend:z2UhvyLhMkmn23s1@cluster0.p5unwig.mongodb.net/comder?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connectd to DataBase!");
    client.login(token);
  })
  .catch((err) => console.log(err));
