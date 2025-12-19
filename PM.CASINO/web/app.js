const botReady = document.getElementById('bot-ready');
const botUser = document.getElementById('bot-user');
const botPrefix = document.getElementById('bot-prefix');
const botSlash = document.getElementById('bot-slash');
const inviteLink = document.getElementById('invite-link');
const widgetFrame = document.getElementById('discord-widget');
const loadWidgetButton = document.getElementById('load-widget');
const guildInput = document.getElementById('guild-id');

const setInviteLink = (clientId) => {
  if (clientId) {
    inviteLink.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=274878295104&scope=bot%20applications.commands`;
  } else {
    inviteLink.href = 'https://discord.com/developers/applications';
  }
};

const setStatus = (ready, username, prefix, slashCommands) => {
  botReady.textContent = ready ? 'En ligne' : 'Hors ligne';
  botReady.className = ready ? 'value' : 'value';
  botUser.textContent = username || '---';
  botPrefix.textContent = prefix || '---';
  botSlash.textContent = slashCommands ?? '---';
};

const refreshStatus = async () => {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) {
      throw new Error('status failed');
    }
    const data = await response.json();
    setStatus(data.ready, data.username, data.prefix, data.slashCommands);
  } catch (error) {
    setStatus(false, null, null, null);
  }
};

const loadConfig = async () => {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('config failed');
    }
    const data = await response.json();
    setInviteLink(data.clientId);
  } catch (error) {
    setInviteLink(null);
  }
};

const loadWidget = () => {
  const guildId = guildInput.value.trim();
  if (!guildId) {
    widgetFrame.src = '';
    return;
  }
  widgetFrame.src = `https://discord.com/widget?id=${guildId}&theme=dark`;
};

loadWidgetButton.addEventListener('click', loadWidget);
guildInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadWidget();
  }
});

refreshStatus();
loadConfig();
setInterval(refreshStatus, 15000);
