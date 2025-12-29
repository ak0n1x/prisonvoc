    const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unbl",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +unbl <user_id>";
    
    const blPath = path.join(__dirname, "../../data/blacklist.json");
    
    if (!fs.existsSync(blPath)) return "❌ Aucune blacklist";
    
    const bl = JSON.parse(fs.readFileSync(blPath, "utf8"));
    
    if (!bl[targetId]) return `❌ ${targetId} n'est pas blacklisté`;
    
    delete bl[targetId];
    fs.writeFileSync(blPath, JSON.stringify(bl, null, 2));
    
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ RETRAIT BLACKLIST")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: true },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};