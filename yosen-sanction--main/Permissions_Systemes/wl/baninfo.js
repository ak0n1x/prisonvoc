const { EmbedBuilder } = require("discord.js");
const banStore = require("../banStore");

module.exports = {
  name: "baninfo",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +baninfo <user_id>";

    const active = banStore.getActiveBan(targetId);
    if (!active) return `❌ ${targetId} n'est pas banni`;

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("BAN - INFORMATIONS")
      .addFields(
        { name: "Utilisateur", value: `\`${targetId}\``, inline: true },
        { name: "Type", value: active.type.toUpperCase(), inline: true },
        { name: "Durée", value: active.duration, inline: true },
        {
          name: "Fin prévue",
          value: active.endsAt ? new Date(active.endsAt).toLocaleString("fr-FR") : "Aucune (infini)",
          inline: true
        },
        { name: "Motif", value: active.reason || "Aucun", inline: false },
        { name: "Statut", value: active.stage || "actif", inline: true }
      )
      .setTimestamp();

    return { embeds: [embed] };
  }
};
