const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "massiverole",
  async execute(userId, roleId) {
    if (!roleId) return "❌ Utilisation: +massiverole <@role>";
    
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("👥 RÔLE MASSIF")
      .addFields(
        { name: "🏷️ Rôle", value: roleId, inline: true },
        { name: "📊 Action", value: "Rôle ajouté à tous", inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};