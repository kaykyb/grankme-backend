import { Request, Response } from "express";

export interface PublicRequest extends Request {}

export interface PrivateRequest extends PublicRequest {
  user: AccessTokenPayload;
}

export interface CommonResponse extends Response {}

export interface AccessTokenPayload {
  sessionId: string;
  uid: string;
  guilds: string[];
  links: string[];
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  guild?: DiscordUserGuild;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: string;
  public_flags?: string;
}

export interface DiscordUserGuild {
  id: string;
  name: string;
  icon?: string;
  owner?: boolean;
  permissions: string;
  features: string[];
}

export interface DiscordChannel {
  id: string;
  type: number;
  guild_id?: string;
  position?: boolean;
  name?: string;
  nsfw?: boolean;
  icon?: string;
}
