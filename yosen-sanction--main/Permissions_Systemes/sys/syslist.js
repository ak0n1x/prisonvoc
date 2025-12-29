const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");
const { readPerms } = require("../utils/permsStore");

module.exports = {
  name: "syslist",
  requiredPerm: PERMS.SYS,

  async execute(userId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    const data = readPerms();
    const list = Object.keys(data).filter((id) => data[id] === "SYS");

    const usersList = list.length
      ? list.map((id, i) => `${i + 1}. <@${id}> (${id})`).join("\n")
      : "Aucun utilisateur";

    const embed = new EmbedBuilder()
      .setColor("#FF00FF")
      .setTitle("📜 SYSTÈME LIST")
      .addFields(
        {
          name: "👥 Utilisateurs SYS :",
          value: `\`\`\`\n${usersList}\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Total : ${list.length}\n> Niveau : SYS (0)\n> Date  : ${new Date().toLocaleString("fr-FR")}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Permission System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
