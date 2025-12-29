const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");
const extractMessage = require("../utils/extractMessage");
const resolveTargetId = require("../utils/resolveTargetId");
const { readPerms, writePerms } = require("../utils/permsStore");

module.exports = {
  name: "addsys",
  requiredPerm: PERMS.SYS,

  async execute(userId, targetArg, ...rest) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const { message } = extractMessage(rest);
    const targetId = resolveTargetId(targetArg, message);

    if (!targetId) return "❌ Utilisation: +addsys <id|@mention>";

    const data = readPerms();
    if (data[targetId] === "SYS") return "ℹ️ Cet utilisateur est déjà SYS.";

    data[targetId] = "SYS";
    writePerms(data);

    const embed = new EmbedBuilder()
      .setColor("#FF00FF")
      .setTitle("✅ SYSTÈME ADD")
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
        { name: "🔐 Niveau :", value: `\`\`\`\nStatut :: AJOUTÉ\nNiveau :: SYS (0)\n\`\`\``, inline: false },
        { name: "📋 Informations :", value: `\`\`\`\n> Statut : ✅ Succès\n> Date   : ${new Date().toLocaleString("fr-FR")}\n\`\`\``, inline: false }
      )
      .setFooter({ text: "YOSEN SANCTION • Permission System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
