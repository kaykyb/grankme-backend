/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `discordSessionId` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the `DiscordSession` table. If the table is not empty, all the data it contains will be lost.
  - The migration will add a unique constraint covering the columns `[discordUserId]` on the table `DiscordLink`. If there are existing duplicate values, the migration will fail.
  - Added the required column `discordUserId` to the `DiscordLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `DiscordLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_discordSessionId_fkey";

-- DropIndex
DROP INDEX "User.email_unique";

-- AlterTable
ALTER TABLE "DiscordLink" ADD COLUMN     "discordUserId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "discordSessionId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "DiscordSession";

-- CreateIndex
CREATE UNIQUE INDEX "DiscordLink.discordUserId_unique" ON "DiscordLink"("discordUserId");

-- AddForeignKey
ALTER TABLE "UserSession" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
