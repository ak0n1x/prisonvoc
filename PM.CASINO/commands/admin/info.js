const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { formatNumber } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('[ADMIN] Infos du casino'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const db = new DatabaseManager();
        const leaderboard = db.getLeaderboard(5);

        let totalGains = 0;
        let totalGames = 0;

        leaderboard.forEach(user => {
            totalGains += user.stats.totalGains;
            totalGames += user.stats.totalGames;
        });

        let msg = '**🏆 Top 5 Joueurs:**\n';
        leaderboard.forEach((user, i) => {
            msg += `${i + 1}. ID: ${user.userId} - ${formatNumber(user.profile.balance)} 🪙\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('📊 Informations du Casino')
            .setColor(0xFFD700)
            .setDescription(msg)
            .addFields(
                { name: 'Total des gains', value: `${formatNumber(totalGains)} 🪙`, inline: true },
                { name: 'Parties jouées', value: formatNumber(totalGames), inline: true }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};
    