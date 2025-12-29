const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "baninfo",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +baninfo <user_id>";
    
    const banPath = path.join(__dirname, "../../data/bans.json");
    
    if (!fs.existsSync(banPath)) return "❌ Cet utilisateur n'est pas banni";
    
    const bans = JSON.parse(fs.readFileSync(banPath, "utf8"));
    const ban = bans[targetId];
    
    if (!ban) return `❌ ${targetId} n'est pas banni`;
    
    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("🔨 BAN INFO")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏰ Date du ban", value: ban.date, inline: true },
        { name: "📝 Raison", value: ban.raison || "Aucune", inline: false },
        { name: "👮 Modérateur", value: ban.by, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};
