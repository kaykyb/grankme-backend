import { prisma } from "@root/modules/prisma";
import { getDiscordEndpoint, getEnv } from "@root/modules/util";
import {
  AccessTokenResponse,
  DiscordUserGuild,
  DiscordUserResponse,
} from "@root/types";
import { UnauthorizedError } from "@root/types/errors";
import fetch from "node-fetch";
import { setexAsync, getAsync } from "./redis";

export const exchangeDiscordCode = async (
  code: string,
  redirect_uri: string,
  scope: string
) => {
  const data = new URLSearchParams({
    client_id: getEnv("DISCORD_CLIENT_ID"),
    client_secret: getEnv("DISCORD_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri,
    scope,
  });

  const exchange = await fetch(getDiscordEndpoint("/oauth2/token"), {
    method: "post",
    body: data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return (await exchange.json()) as AccessTokenResponse;
};

export const refreshDiscordToken = async (refreshToken: string) => {
  const data = new URLSearchParams({
    client_id: getEnv("DISCORD_CLIENT_ID"),
    client_secret: getEnv("DISCORD_SECRET"),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    redirect_uri: getEnv("DISCORD_REDIRECT_URI"),
    scope: "identify email guilds",
  });

  const exchange = await fetch(getDiscordEndpoint("/oauth2/token"), {
    method: "post",
    body: data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!exchange || !exchange.ok) {
    console.log(await exchange.text());

    throw new UnauthorizedError("Error while refresh Discord token", {
      originModule: "discord",
      originService: "server",
    });
  }

  return (await exchange.json()) as AccessTokenResponse;
};

export const storeDiscordAccessToken = async (
  uid: string,
  accessToken: string
) => {
  await setexAsync(`accessToken::${uid}`, 600000, accessToken);
};

export const retrieveDiscordAccessToken = async (uid: string) => {
  try {
    const token = await getAsync(`accessToken::${uid}`);

    if (token) {
      return token as string;
    }
  } catch {}

  const link = await prisma.discordLink.findUnique({
    where: {
      userId: uid,
    },
  });

  if (!link) {
    throw new UnauthorizedError("No Discord link found", {
      originService: "server",
      originModule: "discord",
    });
  }

  const newToken = await refreshDiscordToken(link.refreshToken);

  await prisma.discordLink.update({
    where: {
      userId: uid,
    },
    data: {
      refreshToken: newToken.refresh_token,
    },
  });

  await storeDiscordAccessToken(uid, newToken.access_token);

  return newToken.access_token;
};

export const getCurrentUser = async (accessToken: string) => {
  const me = await fetch(getDiscordEndpoint("/users/@me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return (await me.json()) as DiscordUserResponse;
};

export const getCurrentUserGuilds = async (accessToken: string) => {
  const me = await fetch(getDiscordEndpoint("/users/@me/guilds"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return (await me.json()) as DiscordUserGuild[];
};
