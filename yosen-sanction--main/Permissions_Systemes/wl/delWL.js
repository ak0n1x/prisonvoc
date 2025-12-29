const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");

const permsPath = path.join(__dirname, "../perms.json");

module.exports = {
  name: "delwl",
  requiredPerm: PERMS.SYS,

  execute(userId, targetId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    if (!fs.existsSync(permsPath)) return; // Ignore silencieusement

    const data = JSON.parse(fs.readFileSync(permsPath, "utf8"));

    // ✅ VÉRIFIER SI N'EST PAS WL
    if (data[targetId] !== "WL") {
      return; // Ignore silencieusement
    }

    delete data[targetId];
    fs.writeFileSync(permsPath, JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("❌ WHITELIST REMOVE")
      .addFields(
        {
          name: "👤 Système :",
          value: `\`\`\`\nNom d'utilisateur :: ${targetId}\nIdentifiant       :: ${userId}\n\`\`\``,
          inline: false
        },
        {
          name: "🔑 Whitelist :",
          value: `\`\`\`\nStatut   :: SUPPRIMÉ\nNiveau   :: WL\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Statut : ✅ Succès\n> Date   : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • WL System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
