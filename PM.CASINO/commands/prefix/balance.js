const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { getRankTitle, formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'balance',
    aliases: ['solde', 'bal', 'b'],
    description: 'Voir le solde d’un utilisateur ou le vôtre',
    
    async execute(message, args) {
        const db = new DatabaseManager();

        // Détecter l'utilisateur
        let user;
        if (args[0]) {
            // Si mention
            const mention = message.mentions.users.first();
            if (mention) user = mention;
            // Sinon, si c'est un ID
            else {
                try {
                    user = await message.client.users.fetch(args[0]);
                } catch {
                    return message.reply('❌ Utilisateur introuvable.');
                }
            }
        } else {
            // Par défaut, l'auteur
            user = message.author;
        }

        const userData = db.getUserData(user.id);
        if (!userData) return message.reply('❌ Profil introuvable.');

        const embed = new EmbedBuilder()
            .setTitle(`💰 Solde de ${user.username}`)
            .setColor(0xFFD700)
            .addFields(
                { name: 'Argent', value: `${formatNumber(userData.profile.balance)} 🪙`, inline: true },
                { name: 'Niveau', value: `Lvl ${userData.profile.level}`, inline: true },
                { name: 'Titre', value: getRankTitle(userData.profile.balance), inline: true },
                { 
                    name: 'Statistiques', 
                    value: `Parties: ${userData.stats.totalGames}\nWin Rate: ${userData.stats.winRate}%\nGains: ${formatNumber(userData.stats.totalGains)} 🪙`, 
                    inline: false 
                }
            )
            .setThumbnail(user.avatarURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
};
