const config = require('../config');

function validators(amount, game) {
    const gameConfig = config.GAMES_CONFIG[game];

    if (!gameConfig) return { valid: false, message: 'Jeu invalide' };
    if (typeof amount !== 'number' || isNaN(amount)) return { valid: false, message: 'Montant invalide' };
    if (amount <= 0) return { valid: false, message: 'La mise doit être supérieure à 0 🪙' };
    if (amount < gameConfig.minBet) return { valid: false, message: `Mise minimum: ${gameConfig.minBet} 🪙` };
    if (amount > gameConfig.maxBet) return { valid: false, message: `Mise maximum: ${gameConfig.maxBet} 🪙` };

    return { valid: true, message: 'OK' };
}

module.exports = { validators };
