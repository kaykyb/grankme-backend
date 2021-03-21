import redis from "redis";
import { getEnv } from "./util";

interface CommonExchangeRequest {
  answerChannel: string;
  data: any;
}

interface CommonExchangeResponse<T> {
  ok: boolean;
  data: T;
}

const exchange = redis.createClient({
  url: getEnv("REDIS_EXCHANGE_URL"),
});

const waitMessage = <T>(
  channel: string
): Promise<CommonExchangeResponse<T>> => {
  return new Promise<any>((resolve, reject) => {
    exchange.on("message", (msgChannel, message) => {
      if (msgChannel === channel) {
        resolve(JSON.parse(message));
      }
    });
  });
};

export const postEnvelope = async <T>(
  data: any,
  channel: string,
  answerChannel: string
) => {
  exchange.publish(
    channel,
    JSON.stringify({
      answerChannel,
      data,
    })
  );

  return await waitMessage<T>(answerChannel);
};
