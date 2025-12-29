const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "clear",
  async execute(userId, count, message) {
    // Vérifier que count est fourni et valide
    if (!count || isNaN(count)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("❌ ERREUR SYSTÈME")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "⚠️ Erreur :",
            value: `\`\`\`\nType       :: Arguments invalides\nReason     :: Le nombre est requis\n\`\`\``,
            inline: false
          },
          {
            name: "📝 Utilisation :",
            value: `\`\`\`\n+clear <nombre>\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Clear System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    // Vérifier que le nombre est entre 1 et 100
    const clearCount = parseInt(count);
    if (clearCount < 1 || clearCount > 100) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("❌ ERREUR SYSTÈME")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "⚠️ Erreur :",
            value: `\`\`\`\nType       :: Nombre invalide\nMinimum    :: 1\nMaximum    :: 100\nVotre nb   :: ${clearCount}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Clear System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    // Vérifier que le message et le canal existent
    if (!message || !message.channel) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("❌ ERREUR SYSTÈME")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "⚠️ Erreur :",
            value: `\`\`\`\nType       :: Canal introuvable\nReason     :: Impossible de supprimer les messages\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Clear System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    try {
      // Supprimer les messages
      const deletedMessages = await message.channel.bulkDelete(clearCount, true);
      
      // Embed de succès style hacker
      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("🧹 CLEAR SYSTEM")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "🧹 Nettoyage :",
            value: `\`\`\`\nStatut      :: SUCCÈS\nMessages    :: ${deletedMessages.size}\nType        :: Suppression\n\`\`\``,
            inline: false
          },
          {
            name: "📋 Informations :",
            value: `\`\`\`\n> Date       : ${new Date().toLocaleString('fr-FR')}\n> Modérateur : ${userId}\n> Canal      : ${message.channel.name}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Clear System" })
        .setTimestamp();
      
      return { embeds: [embed] };
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("❌ ERREUR SYSTÈME")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "⚠️ Erreur :",
            value: `\`\`\`\nType       :: Erreur suppression\nReason     :: ${err.message}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Clear System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }
  }
};