const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "wetinfo",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +wetinfo <user_id>";
    
    const wetPath = path.join(__dirname, "../../data/wet.json");
    
    if (!fs.existsSync(wetPath)) return `❌ ${targetId} n'est pas en WET`;
    
    const wet = JSON.parse(fs.readFileSync(wetPath, "utf8"));
    const entry = wet[targetId];
    
    if (!entry) return `❌ ${targetId} n'est pas en WET`;
    
    const embed = new EmbedBuilder()
      .setColor("#FF6600")
      .setTitle("⏰ WET INFO")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏳ Durée", value: entry.time, inline: true },
        { name: "⏰ Date", value: entry.date, inline: false },
        { name: "👮 Modérateur", value: entry.by, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};