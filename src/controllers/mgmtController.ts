import { getGuildChannels, getTopMessagesForChannel } from "@root/modules/bot";
import {
  putChannelOnCache,
  removeChannelFromCache,
} from "@root/modules/channelsCacheManager";
import { exchangeDiscordCode } from "@root/modules/discord";
import { prisma } from "@root/modules/prisma";
import { respond } from "@root/modules/service";
import { getEnv } from "@root/modules/util";
import { PrivateRequest } from "@root/types";
import { NoPermissionError } from "@root/types/errors";
import { Response } from "express";

export const registerGuild = async (req: PrivateRequest, res: Response) => {
  const token = await exchangeDiscordCode(
    req.body.code,
    getEnv("DISCORD_GUILD_REDIRECT_URI"),
    "bot"
  );

  console.log(token);

  if (!token.guild) {
    throw new NoPermissionError("No guild was conceded", {
      originService: "server",
      originModule: "user",
    });
  }

  await prisma.guildLink.create({
    data: {
      guildId: token.guild.id,
      owner: {
        connect: {
          id: req.user.uid,
        },
      },
    },
  });

  respond(res, {
    guild: {
      id: token.guild.id,
      name: token.guild.name,
    },
  });
};

export const linkedGuilds = async (req: PrivateRequest, res: Response) => {
  const guilds = await prisma.guildLink.findMany({
    where: {
      owner: {
        id: req.user.uid,
      },
    },
  });

  respond(res, {
    guilds,
  });
};

export const updateLinkedGuildChannel = async (
  req: PrivateRequest,
  res: Response
) => {
  const linkId = req.params.id;
  const { channelId } = req.body;

  if (!req.user.links.includes(linkId)) {
    throw new NoPermissionError(
      `${req.user.uid} has no permission for link ${linkId}`,
      {
        originModule: "mgmt",
        originService: "server",
      }
    );
  }

  const oldLink = await prisma.guildLink.findFirst({
    where: {
      id: linkId,
    },
  });

  const channels = await getGuildChannels(oldLink.guildId);

  if (!channels.filter((x) => x.id === channelId)) {
    throw new NoPermissionError(
      `${req.user.uid} has no permission for channel ${channelId}`,
      {
        originModule: "mgmt",
        originService: "server",
      }
    );
  }

  const oldChannel = oldLink.selectedChannel;

  const link = await prisma.guildLink.update({
    where: {
      id: linkId,
    },
    data: {
      selectedChannel: channelId,
    },
  });

  if (oldChannel) {
    await removeChannelFromCache(oldChannel);
    await putChannelOnCache(link.selectedChannel);
  }

  respond(res, { selectedChannel: link.selectedChannel });
};

export const topMessagesForLink = async (
  req: PrivateRequest,
  res: Response
) => {
  const linkId = req.params.id;

  if (!req.user.links.includes(linkId)) {
    throw new NoPermissionError(
      `${req.user.uid} has no permission for link ${linkId}`,
      {
        originModule: "mgmt",
        originService: "server",
      }
    );
  }

  const link = await prisma.guildLink.findFirst({
    where: {
      id: linkId,
    },
  });

  const messages = await getTopMessagesForChannel(link.selectedChannel);

  respond(res, { messages });
};
