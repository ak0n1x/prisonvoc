const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const getUserPerm = require("../GetUserPerm");
const PERMS = require("../permission");

module.exports = {
  name: "lock",
  async execute(userId, targetChannel, message) {
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
            value: `\`\`\`\nType       :: Serveur introuvable\nReason     :: Impossible de verrouiller\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Lock System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }

    // Récupérer le canal (utiliser le canal actuel par défaut)
    const channel = message.channel;

    try {
      // Récupérer le rôle @everyone
      const everyoneRole = message.guild.roles.everyone;

      // Vérifier si c'est un canal textuel ou vocal
      if (channel.isTextBased()) {
        // Canal textuel : retirer SEND_MESSAGES
        await channel.permissionOverwrites.edit(everyoneRole, {
          SendMessages: false
        });
      } else if (channel.isVoiceBased()) {
        // Canal vocal : retirer SPEAK et CONNECT
        await channel.permissionOverwrites.edit(everyoneRole, {
          Speak: false,
          Connect: false
        });
      } else {
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
              value: `\`\`\`\nType       :: Type de canal invalide\nReason     :: Doit être textuel ou vocal\n\`\`\``,
              inline: false
            }
          )
          .setFooter({ text: "YOSEN SANCTION • Lock System" })
          .setTimestamp();
        
        return { embeds: [errorEmbed] };
      }

      // Donner les permissions aux SYS
      const sysRole = message.guild.roles.cache.find(r => r.name === "SYS");
      if (sysRole) {
        if (channel.isTextBased()) {
          await channel.permissionOverwrites.edit(sysRole, {
            SendMessages: true
          });
        } else if (channel.isVoiceBased()) {
          await channel.permissionOverwrites.edit(sysRole, {
            Speak: true,
            Connect: true
          });
        }
      }

      // Embed de succès style hacker
      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("🔒 LOCK SYSTEM")
        .setDescription(`
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``)
        .addFields(
          {
            name: "🔒 Verrouillage :",
            value: `\`\`\`\nStatut      :: VERROUILLÉ\nType        :: ${channel.isTextBased() ? "Textuel" : "Vocal"}\nPermissions :: Refusées\n\`\`\``,
            inline: false
          },
          {
            name: "📋 Informations :",
            value: `\`\`\`\n> Canal      : #${channel.name}\n> Date       : ${new Date().toLocaleString('fr-FR')}\n> Modérateur : ${userId}\n> Accès      : SYS seulement\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Lock System" })
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
            value: `\`\`\`\nType       :: Erreur verrouillage\nReason     :: ${err.message}\n\`\`\``,
            inline: false
          }
        )
        .setFooter({ text: "YOSEN SANCTION • Lock System" })
        .setTimestamp();
      
      return { embeds: [errorEmbed] };
    }
  }
};