import { Application, Request, Response } from "express";
import { body } from "express-validator";
import {
  loginWithDiscordCode,
  refreshToken,
} from "./controllers/authController";
import { linkedGuilds, registerGuild } from "./controllers/mgmtController";
import { me, userGuilds } from "./controllers/userController";
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

  app.post(
    "/mgmt/registerGuild",
    [userPlug, body("code").isString(), handleMissingArgsError("user")],
    withGracefulErrorsAsync(registerGuild)
  );
  app.get(
    "/mgmt/linkedGuilds",
    [userPlug],
    withGracefulErrorsAsync(linkedGuilds)
  );
};
