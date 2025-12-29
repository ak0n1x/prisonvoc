const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "kick",
  async execute(userId, targetId, ...reason) {
    if (!targetId) return "❌ Utilisation: +kick <@user> <raison>";
    
    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("👢 EXPULSION")
      .addFields(
        { name: "👤 Utilisateur", value: targetId, inline: true },
        { name: "🔨 Action", value: "Expulsion", inline: true },
        { name: "📝 Raison", value: reason.join(" ") || "Aucune", inline: false },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};