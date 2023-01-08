import "dotenv/config";
import express from "express";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { VerifyDiscordRequest, getRandomEmoji } from "./utils.js";
import {
  ENABLE_COMMAND,
  DISABLE_COMMAND,
  HasGuildCommands,
  GetMessagesFromLast24Hrs,
} from "./commands.js";
// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

let intervalId;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data, channel_id } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    let message = "Command finished.";


    if (name === "enable") {
      console.log("Enabling DELETE IT bot!  UwU");
      var minuteInMs = 60000;
      var multiplier = 1;

      console.log(`Turning on auto run for every ${multiplier} minutes... `);

      if (intervalId) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(async function () {
        // Send a message into the channel where command was triggered from
        console.log("Checking messages...");
        message = await GetMessagesFromLast24Hrs(channel_id);
        console.log("Messages checked.");
      }, minuteInMs * multiplier);
      console.log(`IntervalId: ${intervalId}`);
    }

    if (name === "disable") {
      console.log("Disabling bot...");
      if (intervalId) {
        clearInterval(intervalId);
        message = `Bot disabled.`;
      }
      console.log("Turned off.");
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        // Fetches a random emoji to send from a helper function
        content: message,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  // Check if guild commands from commands.js are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    ENABLE_COMMAND,
    DISABLE_COMMAND,
  ]);
});
