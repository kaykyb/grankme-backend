import {
  exchangeDiscordCode,
  getCurrentUser,
  storeDiscordAccessToken,
} from "@root/modules/discord";
import { prisma } from "@root/modules/prisma";
import { AccessTokenResponse } from "@root/types";
import { Request, Response } from "express";
import crypto from "crypto";
import { createAccessToken } from "@root/modules/jwt";
import { respond } from "@root/modules/service";
import { NoPermissionError } from "@root/types/errors";
import { getEnv } from "@root/modules/util";

export const loginWithDiscordCode = async (req: Request, res: Response) => {
  const token = await exchangeDiscordCode(
    req.body.code,
    getEnv("DISCORD_REDIRECT_URI"),
    "identify email guilds"
  );
  const discordUser = await getCurrentUser(token.access_token);

  const discordLink = await getOrCreateDiscordLink(
    discordUser.id,
    discordUser.email,
    token
  );
  const session = await createUserSession(discordLink.userId);

  const links = await prisma.guildLink.findMany({
    where: {
      userId: discordLink.userId,
    },
  });

  const accessToken = createAccessToken({
    sessionId: session.id,
    uid: discordLink.userId,
    guilds: links ? links.map((l) => l.guildId) : [],
    links: links ? links.map((l) => l.id) : [],
  });

  await storeDiscordAccessToken(discordLink.userId, token.access_token);

  respond(
    res,
    {
      accessToken,
      refreshToken: session.refreshToken,
    },
    200,
    true
  );
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken, sessionId } = req.body;

  const token = await prisma.userSession.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: {
        include: {
          GuildLink: true,
        },
      },
    },
  });

  if (!token || token.refreshToken !== refreshToken) {
    throw new NoPermissionError(
      "No valid combination found for this sessionId and refreshToken.",
      {
        originModule: "auth",
        originService: "server",
      }
    );
  }

  const accessToken = createAccessToken({
    sessionId: sessionId,
    uid: token.userId,
    guilds: token.user.GuildLink
      ? token.user.GuildLink.map((l) => l.guildId)
      : [],
    links: token.user.GuildLink ? token.user.GuildLink.map((l) => l.id) : [],
  });

  respond(
    res,
    {
      accessToken,
    },
    200,
    true
  );
};

const createUserSession = async (userId: string) => {
  return await prisma.userSession.create({
    data: {
      refreshToken: crypto.randomBytes(64).toString("base64"),
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

const getOrCreateDiscordLink = async (
  discordUserId: string,
  email: string,
  token: AccessTokenResponse
) => {
  const link = await prisma.discordLink.findUnique({
    where: { discordUserId },
  });

  if (link) return link;

  return await prisma.discordLink.create({
    data: {
      discordUserId,
      refreshToken: token.refresh_token,
      lastRefreshTime: new Date(),
      user: {
        connectOrCreate: {
          where: {
            email,
          },
          create: {
            email,
          },
        },
      },
    },
  });
};
