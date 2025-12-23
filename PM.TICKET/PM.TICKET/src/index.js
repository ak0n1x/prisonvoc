const path = require('path');
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const { log } = require('./utils/logger');
const config = require('../config/config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const command = require(path.join(commandsPath, file));
    if (command?.name && typeof command.execute === 'function') {
      client.commands.set(command.name, command);
    }
  });

const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const event = require(path.join(eventsPath, file));
    if (event?.name && typeof event.execute === 'function') {
      const handler = (...args) => event.execute(...args, client, config);
      if (event.once) {
        client.once(event.name, handler);
      } else {
        client.on(event.name, handler);
      }
    }
  });

const token = process.env.DISCORD_TOKEN;
if (!token) {
  log('DISCORD_TOKEN manquant. Définissez la variable d’environnement avant de lancer le bot.');
  process.exit(1);
}

client.login(token);
