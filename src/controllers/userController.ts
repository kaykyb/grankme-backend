import {
  getCurrentUser,
  getCurrentUserGuilds,
  retrieveDiscordAccessToken,
} from "@root/modules/discord";
import { respond } from "@root/modules/service";
import { PrivateRequest } from "@root/types";
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
