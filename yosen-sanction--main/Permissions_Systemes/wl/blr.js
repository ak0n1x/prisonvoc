const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "blr",
  async execute(userId, roleId) {
    if (!roleId) return "❌ Utilisation: +blr <role_id>";
    
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🚫 RÔLE BLACKLISTÉ")
      .addFields(
        { name: "🏷️ Rôle", value: roleId, inline: true },
        { name: "🌐 Type", value: "Blacklist Rôle", inline: true },
        { name: "⏰ Date", value: new Date().toLocaleString('fr-FR'), inline: false },
        { name: "👮 Modérateur", value: userId, inline: true }
      )
      .setTimestamp();
    
    return { embeds: [embed] };
  }
};