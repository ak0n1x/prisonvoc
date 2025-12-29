const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "derank",
  async execute(userId, targetId, message) {
    // Vérifier que targetId est fourni
    if (!targetId) {
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
            value: `\`\`\`\nType       :: Arguments manquants\nReason     :: L'ID utilisateur est requis\n\`\`\``,
            inline: false
          },
          {
            name: "📝 Utilisation :",
            value: `\`\`\`\n+derank <@user>\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Derank System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    // Vérifier que le message et le guild existent
    if (!message || !message.guild) {
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
            value: `\`\`\`\nType       :: Serveur introuvable\nReason     :: Impossible de retirer les rôles\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Derank System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    try {
      // Récupérer le membre
      const member = await message.guild.members.fetch(targetId).catch(() => null);

      if (!member) {
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
              value: `\`\`\`\nType       :: Utilisateur introuvable\nID         :: ${targetId}\n\`\`\``,
              inline: false
            }
          )
          .setFooter({ text: "YOSEN SANCTION • Derank System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // Récupérer les rôles à retirer
      const rolesToRemove = member.roles.cache.filter(role => role.id !== message.guild.id);

      if (rolesToRemove.size === 0) {
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
              value: `\`\`\`\nType       :: Aucun rôle à retirer\nUtilisateur :: ${targetId}\n\`\`\``,
              inline: false
            }
          )
          .setFooter({ text: "YOSEN SANCTION • Derank System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // Retirer tous les rôles
      await member.roles.remove(rolesToRemove);

      // Embed de succès style hacker
      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("📉 DERANK SYSTEM")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "👤 Système :",
            value: `\`\`\`\nUtilisateur :: ${targetId}\nModérateur  :: ${userId}\n\`\`\``,
            inline: false
          },
          {
            name: "📉 Derank :",
            value: `\`\`\`\nStatut      :: SUCCÈS\nRôles retirés :: ${rolesToRemove.size}\nType        :: Suppression complète\n\`\`\``,
            inline: false
          },
          {
            name: "📋 Informations :",
            value: `\`\`\`\n> Date       : ${new Date().toLocaleString('fr-FR')}\n> Serveur    : ${message.guild.name}\n> Rôles      : ${rolesToRemove.map(r => r.name).join(", ")}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Derank System" })
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
            value: `\`\`\`\nType       :: Erreur derank\nReason     :: ${err.message}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Derank System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }
  }
};