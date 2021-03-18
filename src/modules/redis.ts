import redis from "redis";
import { promisify } from "util";
import { getEnv } from "./util";

const cache = redis.createClient({
  url: getEnv("REDIS_WEB_URL"),
});

export const getAsync = promisify(cache.get).bind(cache);
export const setAsync = promisify(cache.set).bind(cache);
export const setexAsync = promisify(cache.setex).bind(cache);
