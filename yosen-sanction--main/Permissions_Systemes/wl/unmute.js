const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unmute",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +unmute <@user>";
    
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("🔊 DÉMUTE")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: true },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};