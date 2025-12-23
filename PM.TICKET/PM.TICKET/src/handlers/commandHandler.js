async function handleCommand(message, client, config) {
  const { prefix } = config;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  await command.execute(message, args, { client, config });
}

module.exports = { handleCommand };
