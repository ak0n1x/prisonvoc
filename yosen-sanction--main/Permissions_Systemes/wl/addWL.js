const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");
const extractMessage = require("../utils/extractMessage");
const resolveTargetId = require("../utils/resolveTargetId");
const { readPerms, writePerms } = require("../utils/permsStore");

module.exports = {
  name: "addwl",
  requiredPerm: PERMS.SYS,

  async execute(userId, targetArg, ...rest) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const { message } = extractMessage(rest);
    const targetId = resolveTargetId(targetArg, message);

    if (!targetId) return "❌ Utilisation: +addwl <id|@mention>";

    const data = readPerms();

    // ✅ VÉRIFIER SI DÉJÀ WL
    if (data[targetId] === "WL") {
      return; // Ignore silencieusement
    }

    data[targetId] = "WL";
    writePerms(data);

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ WHITELIST ADD")
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
          name: "🔑 Whitelist :",
          value: `\`\`\`\nStatut   :: AJOUTÉ\nNiveau   :: WL\n\`\`\``,
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
