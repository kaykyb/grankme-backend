import { Request, Response } from "express";
import { respond } from "@root/modules/service";

export const healthz = (req: Request, res: Response) => {
  respond(res, {
    health: "Let Milena be with you.",
  });
};
