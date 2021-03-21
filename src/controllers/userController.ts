import { getGuildChannels } from "@root/modules/bot";
import {
  getCurrentUser,
  getCurrentUserGuilds,
  retrieveDiscordAccessToken,
} from "@root/modules/discord";
import { respond } from "@root/modules/service";
import { PrivateRequest } from "@root/types";
import { NoPermissionError } from "@root/types/errors";
import { Response } from "express";

export const me = async (req: PrivateRequest, res: Response) => {
  const token = await retrieveDiscordAccessToken(req.user.uid);
  const discordUser = await getCurrentUser(token);

  respond(res, { discordUser });
};

export const userGuilds = async (req: PrivateRequest, res: Response) => {
  const token = await retrieveDiscordAccessToken(req.user.uid);
  const guilds = await getCurrentUserGuilds(token);

  respond(res, { guilds });
};

//todo improve security
export const guildChannels = async (req: PrivateRequest, res: Response) => {
  const guildId = req.params.id;

  if (!req.user.guilds.includes(guildId)) {
    throw new NoPermissionError(
      `${req.user.uid} has no permission for guild ${guildId}`,
      {
        originModule: "mgmt",
        originService: "server",
      }
    );
  }

  const channels = await getGuildChannels(guildId);
  respond(res, { channels });
};
