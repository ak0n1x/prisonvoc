const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "bl",
  async execute(userId, targetId, ...reason) {
    if (!targetId) return "❌ Utilisation: +bl <user_id> <raison>";
    
    const blPath = path.join(__dirname, "../../data/blacklist.json");
    const dir = path.dirname(blPath);
    
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const bl = fs.existsSync(blPath) 
      ? JSON.parse(fs.readFileSync(blPath, "utf8"))
      : {};
    
    bl[targetId] = {
      date: new Date().toLocaleString('fr-FR'),
      raison: reason.join(" ") || "Sans raison",
      by: userId
    };
    
    fs.writeFileSync(blPath, JSON.stringify(bl, null, 2));
    
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🚫 BLACKLIST")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "🌐 Type", value: "Blacklist Globale", inline: true },
        { name: "📝 Raison", value: reason.join(" ") || "Aucune", inline: false },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};