const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DatabaseManager } = require('../../database');
const { formatNumber } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('[ADMIN] Ajouter du solde')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Montant à ajouter')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const db = new DatabaseManager();
        const user = interaction.options.getUser('utilisateur');
        const montant = interaction.options.getInteger('montant');

        if (montant <= 0) {
            await interaction.editReply('❌ Le montant doit être positif!');
            return;
        }

        db.updateUserBalance(user.id, montant);
        const userData = db.getUserData(user.id);

        const embed = new EmbedBuilder()
            .setTitle('✅ Dépôt effectué!')
            .setColor(0x00FF00)
            .addFields(
                { name: 'Utilisateur', value: user.username, inline: true },
                { name: 'Montant ajouté', value: `${formatNumber(montant)} 🪙`, inline: true },
                { name: 'Nouveau solde', value: `${formatNumber(userData.profile.balance)} 🪙`, inline: false }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};