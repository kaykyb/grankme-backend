import "reflect-metadata";

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { json } from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { getEnv, log } from "@root/modules/util";
import { putRoutes } from "./router";
import { respondWithError } from "./modules/service";

const start = Date.now(); // used for logging

const app = express();
const corsWhitelist = ["http://localhost:3000", "https://grank.me"];

app.use(json());
app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (origin === undefined || corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Put common routes
putRoutes(app);

// Error handler
app.use((err: any, req: any, res: typeof express.response, next: any) => {
  let message = err.message;
  let status = err.status || 500;

  let name = err.name;
  let originService = "Unknown";
  let originModule = "Unknown";
  let additionalContext;

  if (err.isGrankError) {
    status = err.statusCode;
    originService = err.context.originService;
    originModule = err.context.originModule;
    additionalContext = err.context.additionalContext;
  }

  respondWithError(
    res,
    {
      name,
      message,
      originService,
      originModule,
      additionalContext,
    },
    status,
    false
  );
});

app.listen(getEnv("PORT"), () => {
  const end = Date.now() - start;
  log("server", "start", `Server started in ${end}ms`);
});
