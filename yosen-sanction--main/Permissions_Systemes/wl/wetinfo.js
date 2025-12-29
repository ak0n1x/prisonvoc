const { EmbedBuilder } = require("discord.js");
const banStore = require("../banStore");

module.exports = {
  name: "wetinfo",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +wetinfo <user_id>";

    const entry = banStore.getWetEntry(targetId);
    if (!entry) return `❌ ${targetId} n'est pas en wet list`;

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("WET LIST - DÉTAILS")
      .addFields(
        { name: "Utilisateur", value: `\`${targetId}\``, inline: true },
        { name: "Depuis", value: entry.date || "Inconnu", inline: true },
        { name: "Motif", value: entry.reason || "Wet list", inline: false },
        { name: "Ajouté par", value: entry.by || "N/A", inline: true }
      )
      .setTimestamp();

    return { embeds: [embed] };
  }
};
