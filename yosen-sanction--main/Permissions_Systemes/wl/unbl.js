const { EmbedBuilder } = require("discord.js");
const banStore = require("../banStore");

module.exports = {
  name: "unbl",
  async execute(userId, targetId) {
    if (!targetId) return "❌ Utilisation: +unbl <user_id>";

    const entry = banStore.getBlacklistEntry(targetId);
    if (!entry) return `❌ ${targetId} n'est pas blacklisté`;

    banStore.removeFromBlacklist(targetId);

    const embed = new EmbedBuilder()
      .setColor("#0b0b0b")
      .setTitle("BLACKLIST - RETRAIT")
      .setDescription("L'utilisateur est retiré de la blacklist.")
      .addFields({ name: "Utilisateur", value: `\`${targetId}\`` })
      .setTimestamp();

    return { embeds: [embed] };
  }
};
