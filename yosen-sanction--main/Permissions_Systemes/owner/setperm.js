const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { creatorID } = require("../config");
const PERMS = require("../permission");

const commandPermsPath = path.join(__dirname, "../commandPerms.json");

module.exports = {
  name: "setperm",
  requiredPerm: PERMS.PUBLIC,

  execute(userId, commandName, permName) {
    // Seul le créateur peut modifier
    if (userId !== creatorID) {
      return "❌ Seul le créateur du bot peut modifier les permissions";
    }

    // Vérification arguments
    if (!commandName || !permName) {
      return "❌ Utilisation: +setperm <commande> <SYS|OWNER|WL|PUBLIC>";
    }

    permName = permName.toUpperCase();

    // Vérifier si la permission est valide
    if (!PERMS.hasOwnProperty(permName)) {
      return "❌ Permission invalide. Utilisez: SYS, OWNER, WL ou PUBLIC";
    }

    // Lire le fichier
    const data = fs.existsSync(commandPermsPath)
      ? JSON.parse(fs.readFileSync(commandPermsPath, "utf8"))
      : {};

    // Vérifier que la commande existe
    const oldPerm = data[commandName.toLowerCase()];
    if (!oldPerm) {
      return `❌ Commande '${commandName}' n'existe pas`;
    }

    // Modifier la permission
    data[commandName.toLowerCase()] = permName;
    fs.writeFileSync(commandPermsPath, JSON.stringify(data, null, 2));

    // Embed minimaliste gris
    const embed = new EmbedBuilder()
      .setColor("#808080")
      .addFields(
        {
          name: "Commande",
          value: commandName.toLowerCase(),
          inline: true
        },
        {
          name: "Ancienne Permission",
          value: oldPerm,
          inline: true
        },
        {
          name: "Nouvelle Permission",
          value: permName,
          inline: true
        }
      )
      .setTimestamp();

    return { embeds: [embed] };
  }
};