import { InternalError } from "@root/types/errors";
import fs from "fs";
import { default as nodeFetch, RequestInfo, RequestInit } from "node-fetch";

export const fetch = async (url: RequestInfo, init?: RequestInit) => {
  const response = await nodeFetch(url, init);

  if (!response.ok) {
    throw new InternalError("An internal error happened.", {
      originModule: "fetch-util",
      originService: "discord-web",
    });
  }
};

export const log = (service: string, event: string, msg: string) => {
  console.log(`[${service}] ${event}: ${msg}`);
};

export const getEnv = (prop: string): string => {
  return process.env[prop];
};

export const getDiscordEndpoint = (endpoint: string): string => {
  return `${getEnv("DISCORD_API_ENDPOINT")}${endpoint}`;
};

export const getPubKey = () => {
  return fs.readFileSync(getEnv("JWT_KEYPUB_PATH"), { encoding: "utf-8" });
};

export const getPrivKey = () => {
  return fs.readFileSync(getEnv("JWT_KEY_PATH"), { encoding: "utf-8" });
};

export const PUB_KEY = getPubKey();
export const PRIV_KEY = getPrivKey();
