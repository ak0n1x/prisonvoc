const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unwet",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +unwet <user_id>";
    
    const wetPath = path.join(__dirname, "../../data/wet.json");
    
    if (!fs.existsSync(wetPath)) return `❌ ${targetId} n'est pas en WET`;
    
    const wet = JSON.parse(fs.readFileSync(wetPath, "utf8"));
    
    if (!wet[targetId]) return `❌ ${targetId} n'est pas en WET`;
    
    delete wet[targetId];
    fs.writeFileSync(wetPath, JSON.stringify(wet, null, 2));
    
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ RETRAIT WET")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: true },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};
