-- CreateTable
CREATE TABLE "DiscordToken" (
    "id" TEXT NOT NULL,
    "discordAccessToken" TEXT NOT NULL,
    "discordRefreshToken" TEXT NOT NULL,

    PRIMARY KEY ("id")
);
