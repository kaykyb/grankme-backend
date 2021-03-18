/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[userId]` on the table `DiscordLink`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DiscordLink.userId_unique" ON "DiscordLink"("userId");