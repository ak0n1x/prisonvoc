const { EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { formatNumber } = require('../../utils/helpers');

module.exports = {
    name: 'daily',
    aliases: ['bonus', 'checkin'],
    description: 'Réclamez votre bonus quotidien',
    
    async execute(message, args) {
        const db = new DatabaseManager();
        const userData = await db.getUserData(message.author.id);

        if (!userData) {
            message.reply("❌ Une erreur est survenue lors de la récupération de vos données.");
            return;
        }

        const now = new Date();
        const today = now.toDateString();
        const lastCheckIn = userData.dailyCheckIn ? new Date(userData.dailyCheckIn).toDateString() : null;

        // Vérifie si l'utilisateur a déjà pris son bonus aujourd'hui
        if (lastCheckIn === today) {
            const nextClaim = new Date(userData.dailyCheckIn);
            nextClaim.setDate(nextClaim.getDate() + 1);
            const hoursLeft = Math.floor((nextClaim - now) / (1000 * 60 * 60));
            const minutesLeft = Math.floor(((nextClaim - now) % (1000 * 60 * 60)) / (1000 * 60));
            
            message.reply(`⏰ Vous avez déjà réclamé votre bonus aujourd'hui! Revenez dans ${hoursLeft}h ${minutesLeft}m.`);
            return;
        }

        // Bonus aléatoire entre 50 et 150
        const bonus = Math.floor(Math.random() * 101) + 50;

        // Mise à jour du solde
        userData.profile.balance += bonus;
        userData.dailyCheckIn = now.toISOString();
        await db.saveUserData(message.author.id, userData);

        const embed = new EmbedBuilder()
            .setTitle('✅ Bonus Quotidien Réclamé!')
            .setColor(0x00FF00)
            .setDescription(`Vous avez reçu **+${formatNumber(bonus)} 🪙**!`)
            .addFields(
                { name: 'Nouveau solde', value: `${formatNumber(userData.profile.balance)} 🪙`, inline: true },
                { name: 'Prochain bonus', value: 'Disponible dans 24 heures', inline: true }
            )
            .setFooter({ text: `Bonus aléatoire entre 50 et 150 🪙` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
