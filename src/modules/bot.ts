import { DiscordChannel } from "@root/types";
import { getDiscordEndpoint, getEnv } from "./util";
import fetch from "node-fetch";

export const getGuildChannels = async (guildId: string) => {
  const me = await fetch(getDiscordEndpoint(`/guilds/${guildId}/channels`), {
    headers: {
      Authorization: `Bot ${getEnv("DISCORD_BOT_TOKEN")}`,
    },
  });

  const channels = (await me.json()) as DiscordChannel[];

  return channels.filter((x) => x.type === 0);
};
