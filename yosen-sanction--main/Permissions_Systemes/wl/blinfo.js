const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "blinfo",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +blinfo <user_id>";
    
    const blPath = path.join(__dirname, "../../data/blacklist.json");
    
    if (!fs.existsSync(blPath)) return `❌ ${targetId} n'est pas blacklisté`;
    
    const bl = JSON.parse(fs.readFileSync(blPath, "utf8"));
    const entry = bl[targetId];
    
    if (!entry) return `❌ ${targetId} n'est pas blacklisté`;
    
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🌐 BLACKLIST INFO")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏰ Date", value: entry.date, inline: true },
        { name: "📝 Raison", value: entry.raison || "Aucune", inline: false },
        { name: "👮 Modérateur", value: entry.by, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};
