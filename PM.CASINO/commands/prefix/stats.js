const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'stats',
    aliases: ['statistiques', 'stat'],
    description: 'Voir les stats globales',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const users = db.getLeaderboard(10);

        let totalGames = 0;
        let totalGains = 0;

        users.forEach(user => {
            totalGames += user.stats.totalGames;
            totalGains += user.stats.totalGains;
        });

        const embed = new EmbedBuilder()
            .setTitle('📊 Statistiques Globales du Casino')
            .setColor(0xFFD700)
            .addFields(
                { name: '👥 Joueurs inscrits', value: `${users.length}`, inline: true },
                { name: '🎮 Parties jouées', value: formatNumber(totalGames), inline: true },
                { name: '💰 Gains totaux', value: `${formatNumber(totalGains)} 🪙`, inline: true },
                { name: '📈 Gain moyen', value: `${formatNumber(Math.floor(totalGains / Math.max(totalGames, 1)))} 🪙`, inline: true }
            );

        message.reply({ embeds: [embed] });
    }
};