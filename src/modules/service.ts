import { IncorrectArgsError } from "@root/types/errors";
import { Response } from "express";
import { validationResult } from "express-validator";

export const respond = (
  res: Response,
  data: any,
  status: number = 200,
  ok: boolean = true
) => {
  res.status(status).json({
    status,
    data,
    ok,
  });
};

export const respondWithError = (
  res: Response,
  error: any,
  status: number = 200,
  ok: boolean = true
) => {
  res.status(status).json({
    status,
    error,
    ok,
  });
};

export const getIncorrectArgsError = (modu: string, err: any) =>
  new IncorrectArgsError("Missing or incorrect arguments for endpoint", {
    originModule: modu,
    originService: "server",
    additionalContext: err,
  });

export const getIncorrectArgsLoginError = (err: any) =>
  getIncorrectArgsError("auth", err);

export const handleMissingArgsError = (mod: string) => (
  req: any,
  res: any,
  next: any
) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return next(getIncorrectArgsError(mod, err.array()));
  }

  next();
};
