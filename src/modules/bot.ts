import { DiscordChannel } from "@root/types";
import { getDiscordEndpoint, getEnv } from "./util";
import Discord, { TextChannel, Message } from "discord.js";
import fetch from "node-fetch";

export const client = new Discord.Client();
const ONE_HOUR = 3_600_000;

export const getGuildChannels = async (guildId: string) => {
  const me = await fetch(getDiscordEndpoint(`/guilds/${guildId}/channels`), {
    headers: {
      Authorization: `Bot ${getEnv("DISCORD_BOT_TOKEN")}`,
    },
  });

  const channels = (await me.json()) as DiscordChannel[];

  return channels.filter((x) => x.type === 0);
};

export const getTopMessagesForChannel = async (channelId: string) => {
  const channel = (await client.channels.fetch(
    channelId
  )) as Discord.TextChannel;

  const msgs = formatMessages(
    await getMessagesAfterTimestamp(channel, Date.now() - ONE_HOUR * 24),
    channel.guild.id,
    channel.id
  );

  msgs.sort((a, b) => b.points - a.points);

  return msgs;
};

async function getMessagesAfterTimestamp(
  channel: TextChannel,
  limitTimestamp: number,
  limitPages: number = 25
): Promise<Message[]> {
  const limitPerPage = 100;
  const allMessages: Message[] = [];

  for (let i = 0; i < limitPages; i++) {
    const lastMessage = allMessages[allMessages.length - 1];
    const msgs = await channel.messages.fetch({
      limit: limitPerPage,
      after: lastMessage ? lastMessage.id : undefined,
    });

    const filteredMsgs = msgs
      .filter((x) => x.createdTimestamp >= limitTimestamp)
      .array();

    allMessages.push(...filteredMsgs);

    if (filteredMsgs.length < limitPerPage) {
      break;
    }
  }

  return allMessages;
}

function formatMessages(
  messages: Message[],
  serverId: string,
  channelId: string
) {
  return messages.map(({ content, id, attachments, reactions, author }) => {
    const reactionsParsed = reactions.valueOf().map((v, k) => ({
      reaction: k,
      count: v.count,
    }));

    const upReactions = reactionsParsed.filter((x) => x.reaction === "👍");
    const downReactions = reactionsParsed.filter((x) => x.reaction === "👎");

    const upCount = upReactions.length > 0 ? upReactions[0].count : 1;
    const downCount = downReactions.length > 0 ? downReactions[0].count : 1;

    return {
      id,
      content,
      attachments: attachments.array(),
      reactions: reactionsParsed,
      points: upCount - downCount,
      url: `https://discord.com/channels/${serverId}/${channelId}/${id}`,
      author,
    };
  });
}
