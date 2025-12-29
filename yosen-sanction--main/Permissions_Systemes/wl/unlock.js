const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unlock",
  async execute(userId, targetId, message) {
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("🔓 SALON DÉVERROUILLÉ")
      .addFields(
        { name: "📍 Salon", value: message?.channel?.name || "Actuel", inline: true },
        { name: "🔐 État", value: "Déverrouillé", inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};