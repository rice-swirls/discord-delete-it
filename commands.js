import { DiscordRequest } from './utils.js';

export async function HasGuildCommands(appId, guildId, commands) {
  if (guildId === '' || appId === '') return;

  commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  try {
    const res = await DiscordRequest(endpoint, { method: 'GET' });
    const data = await res.json();

    if (data) {
      const installedNames = data.map((c) => c['name']);
      // This is just matching on the name, so it's not good for updates
      if (!installedNames.includes(command['name'])) {
        console.log(`Installing "${command['name']}"`);
        InstallGuildCommand(appId, guildId, command);
      } else {
        console.log(`"${command['name']}" command already installed`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export async function GetMessagesFromLast24Hrs(channelId) {
  // API endpoint to get and post guild commands

  const endpoint = `channels/${channelId}/messages?limit=100`;
  try {
    const messageDeletionList = [];
    const res = await DiscordRequest(endpoint, { method: "GET" });
    const data = await res.json();

    console.log(`Fetched messages from ChannelId: ${channelId}.`)
    if (data) {
      const messages = data.map((c) => ({
        id: c.id,
        timestamp: c.timestamp,
      }));

      messages.forEach((item) => {
        var date1 = new Date(item.timestamp);

        var timeStamp = Math.round(new Date().getTime() / 1000);
        var timeStampYesterday = timeStamp - 24 * 3600;
        //var cutoff = new Date(timeStampYesterday * 1000);
        var isLessThan24hrsOld = date1 >= new Date(timeStampYesterday * 1000).getTime();
        var isLessThan14DaysOld = date1 > Date.now() - 1000 * 60 * 60 * 24 * 14;

        if (!isLessThan24hrsOld && isLessThan14DaysOld) {
          messageDeletionList.push(item.id);
        }
      });

      if (messageDeletionList.length > 0) {
        console.log(`Deleting ${messageDeletionList.length} messages...`)
        DeleteOldMessages(messageDeletionList, channelId);
        console.log("Done");
        return `Deleted ${messageDeletionList.length} messages.`
      }else{
        return "Nothing to delete or old messages are over 14 days old."
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export async function DeleteOldMessages(messageDeletionList, channelId) {
  const endpoint = `channels/${channelId}/messages/bulk-delete`;
  try {
    await DiscordRequest(endpoint, {
      method: "POST",
      body: { messages: messageDeletionList },
    });
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'POST', body: command });
  } catch (err) {
    console.error(err);
  }
}
// Simple test command
export const ENABLE_COMMAND = {
  name: 'enable', // Must be all lower case
  description: 'Enables the auto delete bot, will delete any message older than 24 hours within 15 days.',
  type: 1,
};
export const DISABLE_COMMAND = {
  name: 'disable', // Must be all lower case
  description: 'Turns off the auto delete bot.',
  type: 1,
};

