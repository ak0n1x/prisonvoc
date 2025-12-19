const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');

module.exports = {
    name: 'reset',
    aliases: ['reinitialiser', 'restart'],
    description: 'Réinitialiser votre compte (IRRÉVERSIBLE!)',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const newData = db.createDefaultUser(message.author.id);
        db.saveUserData(message.author.id, newData);

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Profil réinitialisé')
            .setColor(0xFF0000)
            .setDescription('Votre profil a été réinitialisé à 1000 🪙. Utilisez `;setup` pour recommencer.');

        message.reply({ embeds: [embed] });
    }
};