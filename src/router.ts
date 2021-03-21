import { Application, Request, Response } from "express";
import { body } from "express-validator";
import {
  loginWithDiscordCode,
  refreshToken,
} from "./controllers/authController";
import { healthz } from "./controllers/healthController";
import {
  linkedGuilds,
  registerGuild,
  topMessagesForLink,
  updateLinkedGuildChannel,
} from "./controllers/mgmtController";
import { guildChannels, me, userGuilds } from "./controllers/userController";
import { userPlug } from "./modules/jwt";
import { handleMissingArgsError } from "./modules/service";
import { PrivateRequest } from "./types";

type CommonHandler = (req: PrivateRequest | Request, res: Response) => any;
type CommonAsyncHandler = (
  req: PrivateRequest | Request,
  res: Response
) => Promise<any>;

const withGracefulErrors = (handler: CommonHandler) => {
  return (req: PrivateRequest | Request, res: Response, next: any) => {
    try {
      handler(req, res);
    } catch (err) {
      next(err);
    }
  };
};

const withGracefulErrorsAsync = (handler: CommonAsyncHandler) => {
  return async (req: PrivateRequest | Request, res: Response, next: any) => {
    try {
      await handler(req, res);
    } catch (err) {
      next(err);
    }
  };
};

export const putRoutes = (app: Application) => {
  app.get("/healthz", withGracefulErrors(healthz));

  app.post(
    "/auth/loginWithDiscordCode",
    [body("code").isString(), handleMissingArgsError("auth")],
    withGracefulErrorsAsync(loginWithDiscordCode)
  );

  app.post(
    "/auth/refreshToken",
    [
      body("refreshToken").isString(),
      body("sessionId").isString(),
      handleMissingArgsError("auth"),
    ],
    withGracefulErrorsAsync(refreshToken)
  );

  app.get("/user/me", [userPlug], withGracefulErrorsAsync(me));
  app.get("/user/me/guilds", [userPlug], withGracefulErrorsAsync(userGuilds));
  app.get(
    "/user/guild/:id/channels",
    [userPlug],
    withGracefulErrorsAsync(guildChannels)
  );

  app.post(
    "/mgmt/registerGuild",
    [userPlug, body("code").isString(), handleMissingArgsError("mgmt")],
    withGracefulErrorsAsync(registerGuild)
  );
  app.get(
    "/mgmt/linkedGuilds",
    [userPlug],
    withGracefulErrorsAsync(linkedGuilds)
  );
  app.post(
    "/mgmt/link/:id/selectedChannel",
    [userPlug, body("channelId").isString(), handleMissingArgsError("mgmt")],
    withGracefulErrorsAsync(updateLinkedGuildChannel)
  );
  app.get(
    "/mgmt/link/:id/topMessagesForLink",
    [userPlug],
    withGracefulErrorsAsync(topMessagesForLink)
  );
};
