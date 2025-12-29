const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "tempmute",
  async execute(userId, targetId, time) {
    if (!targetId || !time) return "❌ Utilisation: +tempmute <@user> <temps>";
    
    const muteDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(muteDir)) fs.mkdirSync(muteDir, { recursive: true });
    
    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("🔇 MUTE TEMPORAIRE")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏰ Durée", value: time, inline: true },
        { name: "📝 Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};
