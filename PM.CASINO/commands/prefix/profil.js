const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { getRankTitle, formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'profile',
    aliases: ['prof', 'p'],
    description: 'Voir votre profil',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const userId = args[0]?.replace(/[<@!>]/g, '') || message.author.id;
        
        try {
            const user = await message.client.users.fetch(userId);
            const userData = db.getUserData(userId);

            const embed = new EmbedBuilder()
                .setTitle(`👤 Profil de ${user.username}`)
                .setColor(0x0099FF)
                .setThumbnail(user.avatarURL())
                .addFields(
                    {
                        name: '💰 Économie',
                        value: `Solde: **${formatNumber(userData.profile.balance)} 🪙**\nNiveau: **${userData.profile.level}**\nTitre: **${getRankTitle(userData.profile.balance)}**`,
                        inline: false
                    },
                    {
                        name: '📊 Statistiques',
                        value: `Parties jouées: ${userData.stats.totalGames}\nVictoires: ${userData.stats.totalWins}\nDéfaites: ${userData.stats.totalLosses}\nWin Rate: ${userData.stats.winRate}%\nGains totaux: ${formatNumber(userData.stats.totalGains)} 🪙\nPertes totales: ${formatNumber(userData.stats.totalLossesAmount)} 🪙`,
                        inline: false
                    },
                    {
                        name: '🎤 Vocal',
                        value: `Temps total: ${userData.voice.totalMinutes} min\nGains vocaux: ${formatNumber(userData.voice.totalEarnings)} 🪙`,
                        inline: false
                    }
                );

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Utilisateur non trouvé!');
        }
    }
};