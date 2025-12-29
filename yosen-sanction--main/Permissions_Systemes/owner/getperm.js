const fs = require("fs");
const path = require("path");
const getUserPerm = require("../GetUserPerm");
const { creatorID } = require("../config");
const PERMS = require("../permission");

const commandPermsPath = path.join(__dirname, "../commandPerms.json");

module.exports = {
  name: "getperm",
  requiredPerm: PERMS.PUBLIC, // Accessible à tous

  execute(userId, commandName) {
    // Seul le créateur peut voir les perms
    if (userId !== creatorID) {
      return "❌ Seul le créateur du bot peut utiliser cette commande";
    }

    if (!commandName) {
      return "❌ Utilisation: +getperm <commande>";
    }

    const data = fs.existsSync(commandPermsPath)
      ? JSON.parse(fs.readFileSync(commandPermsPath, "utf8"))
      : {};

    const perm = data[commandName.toLowerCase()];
    
    if (!perm) {
      return `❌ Commande '${commandName}' n'existe pas`;
    }

    return `📋 **${commandName}** → Permission: **${perm}**`;
  }
};
