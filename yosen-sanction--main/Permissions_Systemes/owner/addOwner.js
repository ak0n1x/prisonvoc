const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");

const permsPath = path.join(__dirname, "../perms.json");

module.exports = {
  name: "addowner",
  requiredPerm: PERMS.SYS,

  execute(userId, targetId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const data = fs.existsSync(permsPath)
      ? JSON.parse(fs.readFileSync(permsPath, "utf8"))
      : {};

    // ✅ VÉRIFIER SI DÉJÀ OWNER
    if (data[targetId] === "OWNER") {
      return; // Ignore silencieusement
    }

    data[targetId] = "OWNER";
    fs.writeFileSync(permsPath, JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("✅ OWNER ADD")
      .addFields(
        {
          name: "👤 Système :",
          value: `\`\`\`\nNom d'utilisateur :: ${targetId}\nIdentifiant       :: ${userId}\n\`\`\``,
          inline: false
        },
        {
          name: "👨‍💼 Niveau :",
          value: `\`\`\`\nStatut :: AJOUTÉ\nNiveau :: OWNER (1)\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Statut : ✅ Succès\n> Date   : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Permission System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};