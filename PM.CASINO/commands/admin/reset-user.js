const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetuser')
        .setDescription('[ADMIN] Réinitialiser le compte d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const db = new DatabaseManager();
        const user = interaction.options.getUser('utilisateur');
        const newData = db.createDefaultUser(user.id);
        db.saveUserData(user.id, newData);

        const embed = new EmbedBuilder()
            .setTitle('✅ Compte réinitialisé')
            .setColor(0xFF0000)
            .setDescription(`Le compte de ${user.username} a été réinitialisé à 1000 🪙.`);

        await interaction.editReply({ embeds: [embed] });
    }
};