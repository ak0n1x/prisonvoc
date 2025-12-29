client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = "+"; // ton préfixe
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Vérifier si la commande existe
  const command = client.commands.get(commandName);
  if (!command) return;

  // Pour la commande ban : args[0] = ID, args[1..] = raison
  if (commandName === "ban") {
    const targetId = args.shift(); // retire le premier argument = ID
    const reason = args.join(" "); // tout le reste = raison
    await command.execute(client, message.guild, message.author.id, targetId, reason);
    return;
  }

  // Pour les autres commandes, tu peux passer args normalement
  await command.execute(client, message.guild, message.author.id, args);
});
