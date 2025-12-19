const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');

function formatNumber(number) {
  return number.toLocaleString('fr-FR');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const robCooldown = new Map();
const COOLDOWN_MS = 60 * 60 * 1000; // 1 heure

module.exports = {
  name: 'rob',
  aliases: ['vol', 'steal'],
  description: 'Voler un joueur (cooldown 1h)',

  async execute(message, args) {
    try {
      const db = new DatabaseManager();

      // Vérification du profil du voleur
      const robberData = await db.getUserData(message.author.id);
      if (!robberData || !robberData.profile?.registered) {
        return message.reply('❌ Vous devez d\'abord vous inscrire avec ;setup pour utiliser cette commande.');
      }

      // Récupération de la cible
      const target =
        message.mentions.users.first() ||
        (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);

      if (!target) {
        return message.reply('❌ Utilisation : ;rob @joueur (ou ;rob <id>).');
      }

      if (target.bot) {
        return message.reply('❌ Vous ne pouvez pas voler un bot.');
      }

      if (target.id === message.author.id) {
        return message.reply('❌ Vous ne pouvez pas vous voler vous-même.');
      }

      // Vérification du profil de la cible
      const targetData = await db.getUserData(target.id);
      if (!targetData || !targetData.profile?.registered) {
        return message.reply('❌ Ce joueur n\'est pas inscrit au casino.');
      }

      // Gestion du cooldown
      const now = Date.now();
      const last = robCooldown.get(message.author.id) || 0;
      const remaining = COOLDOWN_MS - (now - last);

      if (remaining > 0) {
        const minutes = Math.ceil(remaining / 60000);
        return message.reply(`⏳ Vous devez attendre encore **${minutes} min** avant de pouvoir voler à nouveau.`);
      }

      // Calcul du vol
      const wanted = randInt(100, 500);
      const targetBalance = targetData.profile.balance ?? 0;

      if (targetBalance <= 0) {
        robCooldown.set(message.author.id, now);
        return message.reply(`😅 ${target.username} est fauché… impossible de voler quoi que ce soit.`);
      }

      const stolen = Math.min(wanted, targetBalance);

      // Mise à jour des soldes
      await db.updateUserBalance(target.id, -stolen);
      await db.updateUserBalance(message.author.id, stolen);

      // Mise à jour du cooldown
      robCooldown.set(message.author.id, now);

      // Embed du succès
      const embed = new EmbedBuilder()
        .setTitle('🦹 Vol réussi !')
        .setColor(0x8B0000)
        .setDescription(
          `👤 **Voleur :** ${message.author}\n` +
          `🎯 **Cible :** ${target}\n\n` +
          `💰 **Montant volé :** ${formatNumber(stolen)} 🪙`
        )
        .setFooter({ text: '⏱️ Cooldown: 1h' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('rob command error:', err);
      return message.reply('❌ Une erreur est survenue pendant le vol.');
    }
  }
};
