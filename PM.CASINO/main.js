const { Client, GatewayIntentBits, Collection, PermissionsBitField } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();
client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.prefix = ';';

const app = express();
const webPort = Number(process.env.WEB_PORT) || 3000;
const webRoot = path.join(__dirname, 'web');

app.use(express.static(webRoot));

app.get('/api/status', (req, res) => {
    res.json({
        ready: client.isReady(),
        username: client.user ? client.user.tag : null,
        prefix: client.prefix,
        slashCommands: client.slashCommands.size
    });
});

app.get('/api/config', (req, res) => {
    res.json({
        clientId: process.env.DISCORD_CLIENT_ID || null
    });
});

app.listen(webPort, () => {
    console.log(`🌐 Site web actif sur le port ${webPort}`);
});

// ==================== Charger les prefix commands ====================
const prefixCommandsPath = path.join(__dirname, 'commands', 'prefix');
if (fs.existsSync(prefixCommandsPath)) {
    const prefixCommandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of prefixCommandFiles) {
        const filePath = path.join(prefixCommandsPath, file);
        const command = require(filePath);
        if (command.name && command.execute) {
            client.prefixCommands.set(command.name, command);
            if (command.aliases) {
                command.aliases.forEach(alias => {
                    client.prefixCommands.set(alias, command);
                });
            }
            console.log(`✅ Commande prefix chargée: ${command.name}`);
        }
    }
}

// ==================== Charger les slash commands (admin) ====================
const slashCommandsPath = path.join(__dirname, 'commands', 'admin');
if (fs.existsSync(slashCommandsPath)) {
    const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of slashCommandFiles) {
        const filePath = path.join(slashCommandsPath, file);
        const command = require(filePath);
        if (command.data && command.execute) {
            client.slashCommands.set(command.data.name, command);
            console.log(`✅ Commande admin (/) chargée: ${command.data.name}`);
        }
    }
}

// ==================== Charger les événements ====================
const eventsPath = fs.existsSync(path.join(__dirname, 'events'))
    ? path.join(__dirname, 'events')
    : path.join(__dirname, 'event');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.name && event.execute) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(client, ...args));
            } else {
                client.on(event.name, (...args) => event.execute(client, ...args));
            }
            console.log(`✅ Événement chargé: ${event.name}`);
        }
    }
}

// ==================== Prefix Commands Handler ====================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('❌ Erreur lors de l\'exécution de la commande!').catch(() => {});
    }
});

// ==================== Slash Commands Handler ====================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    // Vérifier les permissions admin
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ 
            content: '❌ Seuls les administrateurs peuvent utiliser cette commande!',
            ephemeral: true 
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Erreur lors de l\'exécution de la commande!', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Erreur lors de l\'exécution de la commande!', ephemeral: true });
        }
    }
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);
    
    try {
        const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
        if (guild) {
            await guild.commands.set(Array.from(client.slashCommands.values()).map(cmd => cmd.data));
            console.log(`✅ ${client.slashCommands.size} commandes admin (/) synchronisées`);
        }
    } catch (error) {
        console.error('Erreur sync commands:', error);
    }

    client.user.setActivity(`;help pour jouer`, { type: 'WATCHING' });
    
    // Lancer le moniteur vocal
    startVoiceMonitor(client);
});

function startVoiceMonitor(client) {
    setInterval(() => {
        const { DatabaseManager } = require('./database');
        const db = new DatabaseManager();
        db.processVoiceEarnings();
    }, 30000);
}

const botToken = process.env.DISCORD_BOT_TOKEN;
if (botToken) {
    client.login(botToken);
} else {
    console.warn('⚠️ DISCORD_BOT_TOKEN manquant. Le site web fonctionne, mais le bot est désactivé.');
}
