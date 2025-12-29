const { EmbedBuilder } = require("discord.js");
const banStore = require("../banStore");

module.exports = {
  name: "unwet",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +unwet <user_id>";

    const entry = banStore.getWetEntry(targetId);
    if (!entry) return `❌ ${targetId} n'est pas en wet list`;

    banStore.removeWetEntry(targetId);
    const active = banStore.getActiveBan(targetId);
    if (active?.type === "wet") {
      banStore.removeBan(targetId);
    }

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("WET LIST - RETRAIT")
      .setDescription("L'utilisateur est retiré de la wet list. Le bannissement associé est levé.")
      .addFields({ name: "Utilisateur", value: `\`${targetId}\`` })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
