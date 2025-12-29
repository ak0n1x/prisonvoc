const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "wet",
  async execute(userId, targetId, time) {
    if (!targetId || !time) return "❌ Utilisation: +wet <user_id> <temps>";
    
    const wetPath = path.join(__dirname, "../../data/wet.json");
    const dir = path.dirname(wetPath);
    
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const wet = fs.existsSync(wetPath) 
      ? JSON.parse(fs.readFileSync(wetPath, "utf8"))
      : {};
    
    wet[targetId] = {
      date: new Date().toLocaleString('fr-FR'),
      time: time,
      by: userId
    };
    
    fs.writeFileSync(wetPath, JSON.stringify(wet, null, 2));
    
    const embed = new EmbedBuilder()
      .setColor("#FF6600")
      .setTitle("⏰ WET (BANNISSEMENT TEMPORAIRE)")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏳ Durée", value: time, inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};