import redis from "redis";
import { promisify } from "util";
import { prisma } from "./prisma";
import { getEnv } from "./util";

const channelsDb = redis.createClient({
  url: getEnv("REDIS_CHANNELSDB_URL"),
});

const flushdb = promisify(channelsDb.flushdb).bind(channelsDb);
export const getAsync = promisify(channelsDb.get).bind(channelsDb);
export const setAsync = promisify(channelsDb.set).bind(channelsDb);
export const delAsync = promisify(channelsDb.del).bind(channelsDb);

export const resetChannelsCache = async () => {
  await flushdb();
};

export const putChannelOnCache = async (channelId: string) => {
  await setAsync(channelId, "OK");
};

export const removeChannelFromCache = async (channelId: string) => {
  await delAsync(channelId);
};

export const hasChannelInCache = async (channelId: string) => {
  return (await getAsync(channelId)) === "OK";
};

export const dumpFromDb = async () => {
  const links = await prisma.guildLink.findMany();

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    if (link.selectedChannel) {
      await putChannelOnCache(link.selectedChannel);
    }
  }
};
