import redis from "redis";
import { promisify } from "util";

const cache = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

export const getAsync = promisify(cache.get).bind(cache);
export const setAsync = promisify(cache.set).bind(cache);
export const setexAsync = promisify(cache.setex).bind(cache);
