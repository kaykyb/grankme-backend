import {
  resetChannelsCache,
  dumpFromDb,
  hasChannelInCache,
} from "./modules/channelsCacheManager";
import { getEnv, log } from "./modules/util";
import Discord, { TextChannel, Message } from "discord.js";
import { client } from "./modules/bot";

export const start = async () => {
  log("bot", "reset", "Resetando Redis...");
  await resetChannelsCache(); // reset the channels

  log("bot", "reset", "Coletando dados mais recentes do banco de dados.");
  await dumpFromDb(); // dump channels from db

  log("bot", "starting", "O bot está iniciando.");

  const token = getEnv("DISCORD_BOT_TOKEN");

  client.on("message", async (msg) => {
    const tracked = await hasChannelInCache(msg.channel.id);

    if (tracked) {
      msg.react("👍");
      msg.react("👎");
    }
  });

  await client.login(token);

  log("bot", "started", "Bot iniciado.");
};
