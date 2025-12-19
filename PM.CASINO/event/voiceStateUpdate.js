const { DatabaseManager } = require('../database');

module.exports = {
    name: 'voiceStateUpdate',

    async execute(client, oldState, newState) {
        if (newState.member.user.bot) return;

        const db = new DatabaseManager();

        // Utilisateur rejoint un canal vocal
        if (!oldState.channel && newState.channel) {
            const userData = db.getUserData(newState.member.id);
            userData.voice.currentSessionStart = new Date().toISOString();
            db.saveUserData(newState.member.id, userData);

            console.log(`🎤 ${newState.member.user.username} a rejoint le vocal`);
        }

        // Utilisateur quitte un canal vocal
        if (oldState.channel && !newState.channel) {
            const userData = db.getUserData(newState.member.id);

            if (userData.voice.currentSessionStart) {
                const sessionStart = new Date(userData.voice.currentSessionStart);
                const elapsedMinutes = (Date.now() - sessionStart) / 60000;
                const earnings = Math.floor(elapsedMinutes * 5);

                userData.voice.totalMinutes += Math.floor(elapsedMinutes);
                userData.voice.totalEarnings += earnings;
                userData.profile.balance += earnings;
                userData.voice.currentSessionStart = null;

                db.saveUserData(newState.member.id, userData);

                console.log(`✅ ${newState.member.user.username} a gagné ${earnings} 🪙 en vocal`);
            }
        }
    }
};