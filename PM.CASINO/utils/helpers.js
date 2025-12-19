const { EmbedBuilder } = require('discord.js');

function createGameEmbed(title, color, fields) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color);

    fields.forEach(({ name, value, inline = false }) => {
        embed.addField(name, value, inline);
    });

    return embed;
}

function getRankTitle(balance) {
    if (balance < 1000) return '🌱 Novice';
    if (balance < 5000) return '⭐ Joueur';
    if (balance < 20000) return '💎 Expert';
    if (balance < 100000) return '👑 Légende';
    return '🔱 Dieu du Casino';
}

function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

module.exports = {
    createGameEmbed,
    getRankTitle,
    formatNumber
};