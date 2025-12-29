const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");
const extractMessage = require("../utils/extractMessage");
const resolveTargetId = require("../utils/resolveTargetId");
const { readPerms, writePerms } = require("../utils/permsStore");

module.exports = {
  name: "addowner",
  requiredPerm: PERMS.SYS,

  async execute(userId, targetArg, ...rest) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const { message } = extractMessage(rest);
    const targetId = resolveTargetId(targetArg, message);

    if (!targetId) return "❌ Utilisation: +addowner <id|@mention>";

    const data = readPerms();

    // ✅ VÉRIFIER SI DÉJÀ OWNER
    if (data[targetId] === "OWNER") {
      return; // Ignore silencieusement
    }

    data[targetId] = "OWNER";
    writePerms(data);

    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("✅ OWNER ADD")
      .addFields(
        {
          name: "👤 Système :",
          value: `\`\`\`\nMention     :: <@${userId}>\nIdentifiant :: ${userId}\n\`\`\``,
          inline: false
        },
        {
          name: "🎯 Cible :",
          value: `\`\`\`\nMention     :: <@${targetId}>\nIdentifiant :: ${targetId}\n\`\`\``,
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
