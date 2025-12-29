const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "timeout",
  async execute(userId, targetId, time) {
    if (!targetId || !time) return "❌ Utilisation: +timeout <@user> <temps>";
    
    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("⏰ TIMEOUT")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "⏳ Durée", value: time, inline: true },
        { name: "📝 Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};