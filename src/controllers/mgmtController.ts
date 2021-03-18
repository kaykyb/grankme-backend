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
