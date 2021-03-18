-- CreateTable
CREATE TABLE "GuildLink" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildLink.guildId_unique" ON "GuildLink"("guildId");

-- AddForeignKey
ALTER TABLE "GuildLink" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
