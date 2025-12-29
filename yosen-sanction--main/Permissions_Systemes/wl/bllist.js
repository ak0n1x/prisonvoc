const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const blPath = path.join(__dirname, "../../data/blacklist.json");

module.exports = {
  name: "bllist",
  async execute(userId) {
    if (!fs.existsSync(blPath)) {
      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("📜 BLACKLIST LIST")
        .addFields(
          {
            name: "👥 Utilisateurs BL :",
            value: `\`\`\`\nAucun utilisateur\n\`\`\``,
            inline: false
          },
          {
            name: "📋 Informations :",
            value: `\`\`\`\n> Total : 0\n> Date  : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Blacklist System" })
        .setTimestamp();

      return { embeds: [embed] };
    }

    const bl = JSON.parse(fs.readFileSync(blPath, "utf8"));
    const list = Object.keys(bl);

    let usersList = "";
    if (list.length > 0) {
      usersList = list.map((id, i) => `${i + 1}. ${id}`).join("\n");
    } else {
      usersList = "Aucun utilisateur";
    }

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("📜 BLACKLIST LIST")
      .addFields(
        {
          name: "👥 Utilisateurs BL :",
          value: `\`\`\`\n${usersList}\n\`\`\``,
          inline: false
        },
        {
          name: "📋 Informations :",
          value: `\`\`\`\n> Total : ${list.length}\n> Type  : Blacklist Globale\n> Date  : ${new Date().toLocaleString('fr-FR')}\n\`\`\``,
          inline: false
        }
      )
      .setFooter({ text: "YOSEN SANCTION • Blacklist System" })
      .setTimestamp();

    return { embeds: [embed] };
  }
};