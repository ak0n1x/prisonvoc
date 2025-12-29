const { EmbedBuilder } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");

module.exports = {
  name: "mv",
  async execute(userId, targetId, channelId, message) {
    // Vérifier que targetId et channelId sont fournis
    if (!targetId || !channelId) {
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
            value: `\`\`\`\nType       :: Arguments manquants\nReason     :: ID utilisateur et canal requis\n\`\`\``,
            inline: false
          },
          {
            name: "📝 Utilisation :",
            value: `\`\`\`\n+mv <@user> <#canal_vocal>\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Move System" })
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
            value: `\`\`\`\nType       :: Serveur introuvable\nReason     :: Impossible de déplacer\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Move System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    try {
      // Récupérer le membre cible
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
          .setFooter({ text: "YOSEN SANCTION • Move System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // PROTECTION SYS : Vérifier si la cible est SYS
      const targetPerm = getUserPerm(targetId);
      if (targetPerm <= PERMS.SYS) {
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
              value: `\`\`\`\nType       :: Protection SYS\nReason     :: Impossible de déplacer un SYS\nUtilisateur :: ${targetId}\n\`\`\``,
              inline: false
            }
          )
          .setFooter({ text: "YOSEN SANCTION • Move System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // Vérifier que le membre est en vocal
      if (!member.voice.channel) {
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
              value: `\`\`\`\nType       :: Pas en vocal\nUtilisateur :: ${targetId}\nStatut      :: Hors ligne vocal\n\`\`\``,
              inline: false
            }
          )
          .setFooter({ text: "YOSEN SANCTION • Move System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // Récupérer le canal de destination
      const destChannel = await message.guild.channels.fetch(channelId).catch(() => null);

      if (!destChannel || !destChannel.isVoiceBased()) {
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
              value: `\`\`\`\nType       :: Canal introuvable\nReason     :: Doit être un canal vocal\nID         :: ${channelId}\n\`\`\``,
              inline: false
            }
          )
          .setFooter({ text: "YOSEN SANCTION • Move System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // Déplacer le membre
      const oldChannel = member.voice.channel.name;
      await member.voice.setChannel(destChannel);

      // Embed de succès style hacker
      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("➡️ MOVE SYSTEM")
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
            name: "➡️ Déplacement :",
            value: `\`\`\`\nStatut      :: SUCCÈS\nCanal source :: #${oldChannel}\nCanal dest   :: #${destChannel.name}\n\`\`\``,
            inline: false
          },
          {
            name: "📋 Informations :",
            value: `\`\`\`\n> Date       : ${new Date().toLocaleString('fr-FR')}\n> Serveur    : ${message.guild.name}\n> Type       : Vocal\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Move System" })
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
            value: `\`\`\`\nType       :: Erreur déplacement\nReason     :: ${err.message}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Move System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }
  }
};