

require('dotenv').config(); // ← IMPORTANT : Charger .env en premier
const { Client, GatewayIntentBits } = require("discord.js");
const path = require("path");
const fs = require("fs");

// -------------------
// CONFIGURATION
// -------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "+";
const getCommandPerm = require("./Permissions_Systemes/GetCommandPerm");
const getUserPerm = require("./Permissions_Systemes/GetUserPerm");
const checkPerm = require("./Permissions_Systemes/CheckPerm");

// Répertoires contenant les commandes
const COMMAND_DIRS = [
  path.join(__dirname, "Permissions_Systemes", "sys"),
  path.join(__dirname, "Permissions_Systemes", "owner"),
  path.join(__dirname, "Permissions_Systemes", "wl")
];

// -------------------
// CHARGEMENT COMMANDES
// -------------------
const commands = new Map();

for (const dir of COMMAND_DIRS) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Dossier non trouvé: ${dir}`);
    continue;
  }

  const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));
  
  for (const file of files) {
    const cmdPath = path.join(dir, file);
    try {
      const command = require(cmdPath);
      if (command.name && typeof command.execute === "function") {
        commands.set(command.name.toLowerCase(), command);
        console.log(`✅ Commande chargée: ${command.name}`);
      }
    } catch (err) {
      console.error(`❌ Erreur lors du chargement de ${file}:`, err.message);
    }
  }
}

// -------------------
// EVENTS
// -------------------
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();

    const command = commands.get(cmdName);
    if (!command) {
      return;
    }

    // Vérifier les permissions dynamiques
    const requiredPerm = getCommandPerm(cmdName);
    const userPerm = getUserPerm(message.author.id);

    if (!checkPerm(userPerm, requiredPerm)) {
      return message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande");
    }

    // Exécuter la commande
    const result = await command.execute(message.author.id, ...args, message);

    if (result) {
      // Support des embeds
      if (result.embeds) {
        message.reply({ embeds: result.embeds }).catch(err => console.error("Erreur reply:", err));
      } else if (result.content) {
        message.reply(result.content).catch(err => console.error("Erreur reply:", err));
      } else {
        message.reply(result).catch(err => console.error("Erreur reply:", err));
      }
    }
  } catch (err) {
    console.error("Erreur exécution commande:", err);
  }
});

// -------------------
// LOGIN
// -------------------
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("❌ DISCORD_TOKEN non trouvé dans .env");
  console.error("Créez un fichier .env avec: DISCORD_TOKEN=votre_token");
  process.exit(1);
}

client.login(token).catch(err => {
  console.error("❌ Erreur de connexion:", err.message);
  process.exit(1);
});