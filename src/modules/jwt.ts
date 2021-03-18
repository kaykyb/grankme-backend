import { PRIV_KEY, PUB_KEY } from "./util";
import jwt from "jsonwebtoken";
import { AccessTokenPayload, PrivateRequest } from "@root/types";
import { UnauthorizedError } from "@root/types/errors";

export const createAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, PRIV_KEY, {
    expiresIn: "20m",
    algorithm: "RS256",
  });
};

export const decodeAccessToken = (token: string) => {
  return jwt.verify(token, PUB_KEY) as AccessTokenPayload;
};

export const userPlug = (req: PrivateRequest, res: any, next: any) => {
  if (
    !req.headers.authorization ||
    typeof req.headers.authorization !== "string" ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return next(
      new UnauthorizedError("Invalid token.", {
        originService: "server",
        originModule: "authMiddleware-milena-dreams-are-not-real-though",
      })
    );
  }

  try {
    const token = req.headers.authorization.substr(7);
    const user = decodeAccessToken(token);

    req.user = user;
  } catch {
    return next(
      new UnauthorizedError("Invalid token.", {
        originService: "server",
        originModule: "authMiddleware-milena-dreams-are-not-real-though",
      })
    );
  }

  next();
};
