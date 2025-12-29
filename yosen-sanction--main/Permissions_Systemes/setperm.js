const fs = require("fs");
const path = require("path");
const PERMS = require("../permissions");
const checkPerm = require("../checkPerm");

const permsPath = path.join(__dirname, "../commandsPerms.json");

module.exports = {
  name: "setperm",
  requiredPerm: PERMS.SYS, // 🔒 SYS SEULEMENT

  execute(userPerm, commandName, permName) {
    // Vérification permission
    if (!checkPerm(userPerm, this.requiredPerm)) {
      return "❌ Seuls les SYS peuvent utiliser cette commande";
    }

    // Vérification arguments
    if (!commandName || !permName) {
      return "❌ Utilisation: setperm <commande> <SYS|OWNER|WL|PUBLIC>";
    }

    permName = permName.toUpperCase();

    if (!PERMS.hasOwnProperty(permName)) {
      return "❌ Permission invalide (SYS, OWNER, WL, PUBLIC)";
    }

    // Lecture du fichier
    const data = fs.existsSync(permsPath)
      ? JSON.parse(fs.readFileSync(permsPath, "utf8"))
      : {};

    // Set permission de la commande
    data[commandName] = permName;

    fs.writeFileSync(permsPath, JSON.stringify(data, null, 2));

    return `✅ Permission de la commande **${commandName}** définie sur **${permName}**`;
  }
};
