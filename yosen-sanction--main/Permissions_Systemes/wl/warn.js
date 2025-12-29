const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "warn",
  async execute(userId, targetId, ...reason) {
    if (!targetId) return "❌ Utilisation: +warn <@user> <raison>";
    
    const warnsPath = path.join(__dirname, "../../data/warns.json");
    const dir = path.dirname(warnsPath);
    
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const warns = fs.existsSync(warnsPath) 
      ? JSON.parse(fs.readFileSync(warnsPath, "utf8"))
      : {};
    
    if (!warns[targetId]) warns[targetId] = [];
    
    warns[targetId].push({
      date: new Date().toLocaleString('fr-FR'),
      raison: reason.join(" ") || "Sans raison",
      by: userId,
      id: warns[targetId].length + 1
    });
    
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
    
    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("⚠️ AVERTISSEMENT")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "📊 Avertissements", value: warns[targetId].length.toString(), inline: true },
        { name: "📝 Raison", value: reason.join(" ") || "Aucune", inline: false },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};
