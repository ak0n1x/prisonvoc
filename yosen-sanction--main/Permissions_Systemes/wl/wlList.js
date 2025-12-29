const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");
const checkPerm = require("../CheckPerm");

const permsPath = path.join(__dirname, "../perms.json");

module.exports = {
  name: "wllist",
  requiredPerm: PERMS.SYS,

  execute(userId) {
    const userPerm = getUserPerm(userId);
    if (!checkPerm(userPerm, this.requiredPerm)) return;

    if (!fs.existsSync(permsPath)) {
      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("📜 WHITELIST LIST")
        .addFields(
          {
            name: "👥 Utilisateurs WL :",
            value: `\`\`\`\nAucun utilisateur\n\`\`\``,
            inline: false
          },
          {
            name: "📋 Informations :",
            value: `\`\`\`\n> Total : 0\n> Date  : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Permission System" })
        .setTimestamp();

      return { embeds: [embed] };
    }

    const data = JSON.parse(fs.readFileSync(permsPath, "utf8"));
    const list = Object.keys(data).filter(id => data[id] === "WL");

    let usersList = "";
    if (list.length > 0) {
      usersList = list.map((id, i) => `${i + 1}. ${id}`).join("\n");
    } else {
      usersList = "Aucun utilisateur";
    }

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("📜 WHITELIST LIST")
      .addFields(
        {
          name: "👥 Utilisateurs WL :",
          value: `\`\`\`\n${usersList}\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Total : ${list.length}\n> Niveau : WL (2)\n> Date  : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Permission System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
