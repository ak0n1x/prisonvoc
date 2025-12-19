const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { getRankTitle, formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'leaderboard',
    aliases: ['top', 'lb', 'classement'],
    description: 'Voir le classement',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const users = db.getLeaderboard(10);

        const embed = new EmbedBuilder()
            .setTitle('🏆 Top 10 Joueurs')
            .setColor(0xFFD700);

        let description = '';
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            description += `${medal} <@${user.userId}> - ${formatNumber(user.profile.balance)} 🪙 | Lvl ${user.profile.level} | ${getRankTitle(user.profile.balance)}\n`;
        }

        embed.setDescription(description);
        message.reply({ embeds: [embed] });
    }
};
