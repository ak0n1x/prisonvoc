const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");
const { readPerms } = require("../utils/permsStore");

module.exports = {
  name: "ownerlist",
  requiredPerm: PERMS.SYS,

  async execute(userId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const data = readPerms();
    const list = Object.keys(data).filter(id => data[id] === "OWNER");

    const usersList = list.length
      ? list.map((id, i) => `${i + 1}. <@${id}> (${id})`).join("\n")
      : "Aucun utilisateur";

    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("📜 OWNER LIST")
      .addFields(
        {
          name: "👥 Utilisateurs OWNER :",
          value: `\`\`\`\n${usersList}\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Total : ${list.length}\n> Niveau : OWNER (1)\n> Date  : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Permission System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};